package Bloginya::Service::Post;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::Post   qw(POST_STATUS_PUB POST_STATUS_DEL POST_STATUS_DRAFT);
use Bloginya::Model::User   qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Bloginya::Model::Upload qw(large_variant medium_variant);
use Time::Piece             ();
use List::Util              qw(none any);

has 'db';
has 'redis';
has 'current_user';
has 'se_tags';
has 'se_shortname';
has 'se_policy';
has 'se_prose_mirror';
has 'se_drive';


async sub read_p($self, $post_id) {
  my @tables
    = (\'posts p', [-left => \'post_tags pt', 'p.id' => 'pt.post_id'], [-left => \'tags t', 'pt.tag_id' => 't.id'],);
  my @select   = ('p.*', [\'array_agg(t.name)' => 'tags']);
  my @group_by = ('p.id');

  if ($self->current_user) {

    # stats
    push @tables, [-left                                   => \'post_stats ps', 'ps.post_id' => 'p.id'];
    push @select, [\'sum(ps.medium_views + ps.long_views)' => 'views'];
  }

  my $p = (await $self->db->select_p(\@tables, \@select, {'p.id' => $post_id}, {group_by => \@group_by}))
    ->expand->hashes->first;

  # TODO: remove extra info for visitors
  die 'no rights to read this post' if $p && !$self->se_policy->can_read_post($p);
  return $p;
}

async sub get_for_edit_p($self, $post_id) {
  die 'no rights to edit this post' unless await $self->se_policy->can_update_post_p($post_id);

  await $self->_ensure_draft_p($post_id);
  my @tables
    = (\'posts p', [-left => \'post_tags pt', 'p.id' => 'pt.post_id'], [-left => \'tags t', 'pt.tag_id' => 't.id'],);
  my @select = (
    qw(p.user_id p.category_id p.status p.description p.enable_likes p.enable_comments),
    [\'array_remove(array_agg(t.name), NULL)' => 'tags']
  );
  my @group_by = ('p.id');

  # draft
  push @tables, [-left => \'post_drafts pd', 'pd.post_id' => 'p.id'],
    [-left => \'uploads uwp', 'uwp.id' => 'pd.picture_wp'], [-left => \'uploads upre', 'upre.id' => 'pd.picture_pre'];

  push @select, ['pd.title' => 'title'], ['pd.document' => 'document',],
    [large_variant('uwp') => 'picture_wp', [medium_variant('upre') => 'picture_pre']];
  push @group_by, 'pd.post_id', 'uwp.id', 'upre.id';

  # shortname
  push @tables,   [-left     => \'shortnames sn', 'sn.post_id' => 'p.id'];
  push @select,   ['sn.name' => 'shortname'];
  push @group_by, 'shortname';

  my $p = (await $self->db->select_p(\@tables, \@select, {'p.id' => $post_id}, {group_by => \@group_by}))
    ->expand->hashes->first;

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

  $fields{document} = {-json => $fields{document}} if exists $fields{document};
  for (qw(picture_wp picture_pre)) {
    next unless $fields{$_};
    $fields{$_} = $self->se_drive->extract_upload_id($fields{$_});
  }

  await $self->db->update_p('post_drafts', \%fields, {post_id => $post_id});
}

async sub apply_changes_p ($self, $post_id, $meta) {
  die "no rights" unless (await $self->se_policy->can_update_post_p($post_id));

  my %post_values = map { $_ => $meta->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw (category_id status enable_likes enable_comments)
  } keys %$meta;

  $post_values{modified_at}  = \'now()';
  $post_values{deleted_at}   = \'now()' if $post_values{status} eq 'del';
  $post_values{published_at} = \'now()' if $post_values{status} eq 'pub';

  my sub _fdraft ($n) {
    \["(select $n from post_drafts where post_id = (?))", $post_id];
  }
  $post_values{$_} = _fdraft($_) for (qw(title document picture_wp picture_pre));

  my $tx = $self->db->begin;

  await $self->db->update_p('posts', \%post_values, {id => $post_id});
  await $self->db->delete_p('post_drafts', {post_id => $post_id});

  if (my $tags = $meta->{tags}) {
    await $self->se_tags->apply_tags_p($post_id, $tags) if @$tags;
  }

  if (my $sn = $meta->{shortname}) {
    await $self->se_shortname->set_shortname_for_post($post_id, $sn);
  }

  await $self->_update_meta_from_content_p($post_id);

  $tx->commit;

  return 1;
}

async sub _update_meta_from_content_p($self, $post_id) {
  my @picture_cols = qw(
    picture_wp
    picture_pre
  );

  my $row = (await $self->db->select_p('posts', ['document', @picture_cols], {id => $post_id}, {for => 'update'}))
    ->expand->hashes->first;
  die "not found post $post_id" unless $row;

  my $doc  = $row->{document};
  my $pics = $self->se_prose_mirror->get_all_images($doc);
  my @ids  = map { $self->se_drive->extract_upload_id($_) } grep {$_} map { $_->{attrs}{src} } @$pics;

  my $pics_num = @ids;

  for (@picture_cols) {
    push @ids, $row->{$_} if $row->{$_};
  }

  my $ttr = $self->se_prose_mirror->estimate_ttr_min($doc);

  await $self->db->delete_p('post_uploads', {post_id => $post_id, upload_id => {-not_in => \@ids}});
  await $self->db->update_p('posts', {meta => {-json => {ttr => $ttr, pics => $pics_num}}}, {id => $post_id});
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
    ['posts',    [-left => 'shortnames', 'posts.id' => 'shortnames.post_id']],
    ['posts.id', 'posts.picture', 'posts.title', 'posts.created_at', 'shortnames.name'],
    {'status' => POST_STATUS_PUB},
    {order_by => [{-desc => 'posts.created_at'}], limit => $limit}
  );

  return $res->hashes;
}

async sub list_posts_by_category_p($self, $category_id, $limit = 5) {
  my @p_fields = ('p.id', 'shortnames.name', 'p.picture', 'p.category_id', 'p.title', 'p.description',);
  my $res      = await $self->db->select_p(
    [
      \'posts p',
      [-left => 'shortnames', 'p.id'             => 'shortnames.post_id'],
      [-left => 'post_tags',  'p.id'             => 'post_tags.post_id'],
      [-left => 'tags',       'post_tags.tag_id' => 'tags.id']
    ],
    [@p_fields, [\'array_agg(tags.name)' => 'tags'],],
    {'p.category_id' => $category_id, 'status' => POST_STATUS_PUB},
    {group_by        => \@p_fields,   order_by => {-desc => 'p.created_at'}}
  );

  my %posts_by_category;
  for my $row ($res->hashes->@*) {
    $posts_by_category{$row->{category_id}} = $row;
  }

  return \%posts_by_category;
}

async sub list_popular_posts_p($self, $limit = 18, $offset = 0) {
  my $res = await $self->db->select_p(
    [
      'posts',
      [-left => 'shortnames', 'posts.id' => 'shortnames.post_id'],
      [-left => 'post_stats', 'posts.id' => 'post_stats.post_id'],
      [-left => 'comments',   'posts.id' => 'comments.post_id'],
      [-left => 'post_likes', 'posts.id' => 'post_likes.post_id']
    ],
    [
      'posts.id',
      'posts.picture',
      'shortnames.name',
      [
        \'(post_stats.short_views + post_stats.medium_views + post_stats.long_views + count(comments.id) + count(post_likes.*))'
          => 'popularity'
      ]
    ],
    {'status' => POST_STATUS_PUB},
    {
      group_by => [
        'posts.id', 'shortnames.name', 'posts.picture', 'post_stats.short_views',
        'post_stats.medium_views', 'post_stats.long_views'
      ],
      order_by => [{-desc => 'popularity'}]
    },

    {limit => $limit, offset => $offset}
  );

  return $res->hashes;
}


1;
