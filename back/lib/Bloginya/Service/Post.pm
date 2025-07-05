package Bloginya::Service::Post;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::Post        qw(POST_STATUS_PUB POST_STATUS_DEL POST_STATUS_DRAFT);
use Bloginya::Model::ProseMirror qw(is_image is_text);
use Bloginya::Model::Upload      qw(upload_id);
use Bloginya::Model::User        qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Iterator::Simple             qw(:all);
use List::Util                   qw(none any);
use Time::Piece                  ();

has 'db';
has 'redis';
has 'current_user';
has 'se_tags';
has 'se_shortname';
has 'se_policy';
has 'se_prose_mirror';
has 'se_drive';
has 'se_language';
has 'log';

async sub get_drafts_p ($self) {
  die 'not authorized' unless my $u = $self->current_user;

  my $db  = $self->db;
  my $res = await $db->select_p(
    [\'posts p', [-left => \'post_drafts d', 'd.post_id' => 'p.id']],
    [
      'p.id',
      [\'coalesce(p.picture_pre, d.picture_pre) ', 'picture_pre'],
      [\'coalesce(d.title, p.title)',              'title'],
      'p.created_at', ['d.post_id' => 'draft_id'], 'p.status',
    ],
    {'p.user_id' => $u->{id}, -or => {'d.post_id' => {'!=', undef}, 'p.status' => POST_STATUS_DRAFT}},
    {order_by    => {-desc => 'created_at'}}
  );

  my (@continue_edit, @drafts);

  for my $post ($res->hashes->@*) {
    if ($post->{status} eq POST_STATUS_DRAFT) {
      push @drafts, $post;
    }
    else {
      push @continue_edit, $post;
    }
  }

  +{continue_edit => \@continue_edit, drafts => \@drafts};
}


async sub read_p($self, $post_id) {
  $self->log->debug("Attempting to read post $post_id");
  die 'no rights to read post' unless await $self->se_policy->can_read_post_p($post_id);
  $self->log->trace("Policy check passed for reading post $post_id");

  # Define table joins for the query
  my @tables = (
    \'posts p',
    [-left => \'categories c',   'p.category_id' => 'c.id'],
    [-left => \'shortnames psn', 'p.id'          => 'psn.post_id'],
    [-left => \'shortnames csn', 'c.id'          => 'csn.category_id'],
    [-left => \'uploads uwp',    'uwp.id'        => 'p.picture_wp'],
    [-left => \'uploads upre',   'upre.id'       => 'p.picture_pre'],
  );

  # Define columns to select
  my @select = (

    # --- Core Post Fields ---
    qw(p.id p.title p.document p.description p.enable_likes p.enable_comments psn.name),
    [\'coalesce(p.published_at, p.created_at)', 'date'],    # Use created_at as fallback for date
    [\"p.meta->>'ttr'", 'ttr'], [\"p.meta->>'pics'", 'pics'],

    # --- Category Fields ---
    'p.category_id', ['c.title' => 'category_title'], ['csn.name' => 'category_name'],

    # --- Picture/Upload Fields ---
    ['uwp.id' => 'picture_wp'], ['upre.id' => 'picture_pre'],

    # --- Aggregated Data (Subqueries) ---
    [
      \'(
        select coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from post_tags pt join tags t on t.id = pt.tag_id
        where pt.post_id = p.id
      )' => 'tags'
    ],
    [\'(select count(*) from comments where post_id = p.id)'   => 'comments'],
    [\'(select count(*) from post_likes where post_id = p.id)' => 'likes'],
  );

  my $user = $self->current_user;
  if ($user) {
    $self->log->trace("User " . $user->{id} . " is reading post, adding user-specific fields.");

    # Check if the current user has liked this post
    push @select,
      \['(select exists(select 1 from post_likes where post_id = ? and user_id = ?)) as liked', $post_id, $user->{id}];

    # Get view stats (only for logged-in users, presumably authors/admins)
    push @select,
      [\'(select sum(ps.medium_views + ps.long_views) from post_stats ps where ps.post_id = p.id)' => 'views'];
  }
  else {
    $self->log->trace("Visitor is reading post, no user-specific fields added.");
  }

  my $p = (await $self->db->select_p(\@tables, \@select, {'p.id' => $post_id},))->expand->hashes->first;

  unless ($p) {
    $self->log->warn("Post with id $post_id not found after policy check.");

    # The policy check should prevent this, but it's good practice to handle it.
    die "post not found";
  }

  # For visitors, the 'liked' field is not selected, so it will be undef.
  # We explicitly set it to a false value for API consistency.
  $p->{liked} = 0 unless defined $p->{liked};

  $self->_handle_society($p);

  # TODO: remove extra info for visitors

  $self->log->info("Successfully read post $post_id: '$p->{title}'");
  return $p;
}

async sub search_similliar_posts_p($self, $post_id, $limit = 12) {
  return unless await $self->se_policy->can_read_post_p($post_id);

  my $result = await $self->db->query_p(
    q~
    with this_cont as (
      select plain_content
      from post_fts
      where post_id = (?)
    ),
    this_post as (
      select category_id
      from posts
      where id = (?)
    ),
    this_tags as (
      select tag_id
      from post_tags
      where
        post_id = (?)
    )

    select
      p.id,
      p.title,
      p.description,
      upre.id as picture_pre,
      (
        select
          coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from post_tags pt join tags t on t.id = pt.tag_id
        where pt.post_id = p.id
      ) as tags,

      round(
        similarity(
          pfts.plain_content,
          (select plain_content from this_cont)
        )::numeric,
        1
      ) as similarity,

      (select count(*) from (
        select tag_id from this_tags
        intersect
        select tag_id from (
          select tag_id from post_tags
          where post_id = p.id
        )
      )) as tags_similarity,

      sn.name

    from posts p
    join post_fts pfts on pfts.post_id = p.id
    left join uploads upre on picture_pre = upre.id
    left join shortnames sn on sn.post_id = p.id
    where
      p.status = 'pub' and
      p.category_id = (select category_id from this_post)
      and p.id != (?)
    order by
     similarity desc,
     tags_similarity desc
    limit (?)
  ~, ($post_id) x 4, $limit
  );

  return $result->hashes;
}

sub _handle_society($self, $p) {
  if (!$p->{enable_likes}) {
    delete @{$p}{qw(likes liked)};
  }
  if (!$p->{enable_comments}) {
    delete($p->{comments});
  }
}

async sub like_post_p ($self, $post_id) {
  die 'no rights' unless my $u = $self->current_user;
  await $self->db->insert_p('post_likes', {user_id => $u->{id}, post_id => $post_id}, {on_conflict => undef});
}
async sub unlike_post_p ($self, $post_id) {
  die 'no rights' unless my $u = $self->current_user;
  await $self->db->delete_p('post_likes', {user_id => $u->{id}, post_id => $post_id});
}

async sub get_for_edit_p($self, $post_id) {
  die 'no rights to edit this post' unless await $self->se_policy->can_update_post_p($post_id);

  await $self->_ensure_draft_p($post_id);
  my @tables = (\'posts p');
  my @select = (
    qw(p.user_id p.category_id p.status p.description p.enable_likes p.enable_comments),
    [
      \'( select coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[]) from post_tags pt join tags t on pt.tag_id = t.id where pt.post_id = p.id )'
        => 'tags'
    ]
  );

  # draft
  push @tables, [-left => \'post_drafts pd', 'pd.post_id' => 'p.id'],
    [-left => \'uploads uwp', 'uwp.id' => 'pd.picture_wp'], [-left => \'uploads upre', 'upre.id' => 'pd.picture_pre'];

  push @select, ['pd.title' => 'title'], ['pd.document' => 'document',],
    ['uwp.id' => 'picture_wp', ['upre.id' => 'picture_pre']];

  # shortname
  push @tables, [-left     => \'shortnames sn', 'sn.post_id' => 'p.id'];
  push @select, ['sn.name' => 'shortname'];

  my $p = (await $self->db->select_p(\@tables, \@select, {'p.id' => $post_id},))->expand->hashes->first;

  return $p;
}

async sub _ensure_draft_p($self, $post_id) {
  my $f = join(',', qw(title document picture_wp picture_pre));
  await $self->db->query_p(
    qq~
      insert into post_drafts (post_id, $f)
      select id, $f from posts where id = (?)
      on conflict do nothing~, $post_id
  );
}

async sub update_draft_p ($self, $post_id, $fields) {
  die "no rights" unless (await $self->se_policy->can_update_post_p($post_id));

  my %fields = map { $_ => $fields->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw(title document picture_wp picture_pre)
  } keys %$fields;


  my $it_img_ids = $self->se_prose_mirror->it_img_ids;
  my $iterator   = igrep { is_image($_) } $self->se_prose_mirror->iterate($$fields{document});
  while (my $el = <$iterator>) {
    $it_img_ids->($el);
  }
  my $img_ids = $it_img_ids->();
  my ($picture_pre) = @$img_ids;
  $fields{picture_pre} = $picture_pre;

  # $fields{title} =~ s/(\s)\s+/\1/;
  $fields{document} = {-json => $fields{document}} if exists $fields{document};
  for (qw(picture_wp picture_pre)) {
    next unless $fields{$_};
    $fields{$_} = upload_id($fields{$_});
  }

  await $self->db->update_p('post_drafts', \%fields, {post_id => $post_id});
}

async sub apply_changes_p ($self, $post_id, $meta) {
  my $old = (await $self->db->select_p('posts', ['user_id', 'status'], {id => $post_id}))->hashes->first;
  die "no rights" unless $self->se_policy->can_update_post($old);

  my %post_values = map { $_ => $meta->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw (category_id status enable_likes enable_comments)
  } keys %$meta;

  die "missing category" if $post_values{status} eq POST_STATUS_PUB && !$post_values{category_id};

  $post_values{modified_at}  = \'now()';
  $post_values{deleted_at}   = \'now()' if $old->{status} ne POST_STATUS_DEL && $post_values{status} eq POST_STATUS_DEL;
  $post_values{published_at} = \'now()' if $old->{status} ne POST_STATUS_PUB && $post_values{status} eq POST_STATUS_PUB;

  my sub _fdraft ($n) {
    \["(select $n from post_drafts where post_id = (?))", $post_id];
  }
  $post_values{$_} = _fdraft($_) for (qw(title document picture_wp picture_pre));

  my $tx = $self->db->begin;

  await $self->db->update_p('posts', \%post_values, {id => $post_id});
  await $self->db->delete_p('post_drafts', {post_id => $post_id});

  await $self->se_tags->apply_tags_p($post_id, $meta->{tags});
  await $self->se_shortname->set_shortname_for_post($post_id, $meta->{shortname});

  await $self->_update_meta_from_content_p($post_id);

  $tx->commit;

  return 1;
}

async sub _update_meta_from_content_p($self, $post_id) {
  my @picture_cols = qw(
    picture_wp
    picture_pre
  );

  my $row = (await $self->db->select_p(
    ['posts',    [-left     => \'categories c', 'c.id' => 'posts.category_id']],
    ['document', ['c.title' => 'ctitle'], map {"posts.$_"} @picture_cols],
    {'posts.id' => $post_id},
  ))->expand->hashes->first;
  die "not found post $post_id" unless $row;

  my $doc = $row->{document};

  my $it_ttr     = $self->se_prose_mirror->it_ttr;
  my $it_img_ids = $self->se_prose_mirror->it_img_ids;
  my $it_text    = $self->se_prose_mirror->it_text;

  my $iterator = igrep { is_image($_) || is_text($_) } $self->se_prose_mirror->iterate($doc);

  while (my $el = <$iterator>) {
    $it_ttr->($el);
    $it_img_ids->($el);
    $it_text->($el);
  }

  my $ttr     = $it_ttr->();
  my $img_ids = $it_img_ids->();
  my $text    = $it_text->();

  my $descr = substr($text, 0, 200) . (length($text) > 200 ? '...' : '');

  my $pics_num = @$img_ids;
  my ($picture_pre) = @$img_ids;

  for (@picture_cols) {
    push @$img_ids, $row->{$_} if $row->{$_};
  }

  my $lang = await $self->se_language->detect_lang_p($text, $row->{ctitle});
  await $self->db->insert_p('languages', {code => $lang}, {on_conflict => undef});
  await $self->db->delete_p('post_fts', {post_id => $post_id});
  await $self->db->insert_p(
    'post_fts',
    {
      post_id       => $post_id,
      lcode         => $lang,
      plain_content => $text,
      fts           => \['to_tsvector((select fts_cfg from languages where code = (?)), (?))', $lang, $text],
    },
    {on_conflict => [['post_id', 'lcode'] => {fts => \'EXCLUDED.fts'}]},
  );
  await $self->db->delete_p('post_uploads', {post_id => $post_id, upload_id => {-not_in => $img_ids}});
  await $self->db->update_p(
    'posts',
    {meta => {-json => {ttr => $ttr, pics => $pics_num}}, picture_pre => $picture_pre, description => $descr},
    {id   => $post_id}
  );
}


async sub link_upload_to_post_p($self, $post_id, $upload_path) {
  await $self->db->insert_p('post_uploads', {post_id => $post_id, upload_id => $upload_path}, {on_conflict => undef});
}

async sub create_draft_p($self) {
  die "no rights to create draft" unless $self->se_policy->can_create_post;

  my $t = Time::Piece->new;
  $t = join ' ', ($t->mday, $t->monname);

  my $user_id = $self->current_user->{id};

  my $res = await $self->db->insert_p(
    'posts',
    {
      user_id  => $user_id,
      document => {-json => {type => 'doc', content => []}},
      meta     => {-json => {ttr  => 0,     pics    => 0}},
      title    => "Draft $t"
    },
    {returning => 'id'},
  );

  return $res->hashes->first->{id};
}

async sub list_new_posts_p($self, $limit = 8) {
  my $res = await $self->db->select_p(
    [
      \'posts p',
      [-left => \'shortnames sn',  'p.id'    => 'sn.post_id'],
      [-left => \'uploads upre',   'upre.id' => 'p.picture_pre'],
      [-left => \'categories c',   'c.id'    => 'p.category_id'],
      [-left => \'shortnames csn', 'c.id'    => 'csn.category_id'],
    ],
    [
      'p.id',                       ['c.title' => 'category_title'],
      ['c.id' => 'category_id'],    ['csn.name' => 'category_name'],
      ['upre.id' => 'picture_pre'], 'p.title',
      'p.created_at',               'sn.name'
    ],
    {'status' => POST_STATUS_PUB},
    {order_by => \'p.published_at desc nulls last', limit => $limit}
  );

  return $res->hashes;
}

async sub list_posts_by_category_p($self, $category_id, $limit = 5) {
  my @p_fields = ('p.id', 'sn.name', ['upre.id' => 'picture_pre'], 'p.category_id', 'p.title', 'p.description',);
  my $res      = await $self->db->select_p(
    [
      \'posts p',
      [-left => \'shortnames sn', 'p.id'    => 'sn.post_id'],
      [-left => \'uploads upre',  'upre.id' => 'p.picture_pre'],
    ],
    [
      @p_fields,
      [
        \'(
        select
          coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from post_tags pt join tags t on t.id = pt.tag_id
        where pt.post_id = p.id
      )' => 'tags'
      ],
    ],
    {'p.category_id' => $category_id,                    'status' => POST_STATUS_PUB},
    {order_by        => \'p.created_at desc nulls last', limit    => $limit}
  );

  return $res->hashes;
}

async sub list_popular_posts_p($self, $limit = 26, $offset = 0) {
  my $res = await $self->db->select_p(
    [
      \'posts p',
      [-left => \'shortnames sn', 'p.id'    => 'sn.post_id'],
      [-left => \'uploads upre',  'upre.id' => 'p.picture_pre'],
    ],
    [
      'p.id',
      'sn.name',
      ['upre.id' => 'picture_pre'],
      [
        \q~
        (
        select
          coalesce((select count(*) from comments com where com.post_id = p.id), 0) * 4
          +
          coalesce((select count(*) from post_likes lik where lik.post_id = p.id), 0) * 2
          +
          coalesce((select (short_views * 0.5 + medium_views + long_views * 2) from post_stats ps where ps.post_id = p.id), 0)
        )
      ~ => 'popularity'
      ]
    ],
    {'status' => POST_STATUS_PUB},
    {order_by => {-desc => 'popularity'}, limit => $limit, offset => $offset},
  );

  return $res->hashes;
}


1;
