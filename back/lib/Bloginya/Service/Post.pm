package Bloginya::Service::Post;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::Post qw(POST_STATUS_PUB POST_STATUS_DEL POST_STATUS_DRAFT is_updatable_field);
use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Time::Piece           ();
use List::Util            qw(none any);

has 'db';
has 'redis';
has 'current_user';


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

  die 'no rights to read this post' if $p && !$self->_can_read_post($p);
  return $p;
}

async sub get_for_edit_p($self, $post_id) {
  die 'no rights to edit this post' unless $self->current_user;

  await $self->_ensure_draft_p($post_id);
  my @tables
    = (\'posts p', [-left => \'post_tags pt', 'p.id' => 'pt.post_id'], [-left => \'tags t', 'pt.tag_id' => 't.id'],);
  my @select = (
    qw(p.user_id p.category_id p.status p.description p.enable_likes p.enable_comments),
    [\'array_agg(t.name)' => 'tags']
  );
  my @group_by = ('p.id');

  # draft
  push @tables, [-left => \'post_drafts pd', 'pd.post_id' => 'p.id'];
  push @select, ['pd.title' => 'title'], ['pd.document' => 'document',],
    ['pd.picture_wp' => 'picture_wp', ['pd.picture_pre' => 'picture_pre']];
  push @group_by, 'pd.post_id';

  my $p = (await $self->db->select_p(\@tables, \@select, {'p.id' => $post_id}, {group_by => \@group_by}))
    ->expand->hashes->first;

  die 'no rights to edit this post' if $p && !$self->_can_update_post($p);
  return $p;
}

async sub _ensure_draft_p($self, $post_id) {
  try {
    my $f = join(',', qw(title document picture_wp picture_pre));
    await $self->db->query_p(
      qq~
      insert into post_drafts (post_id, $f)
      select id, $f from posts where id = (?)
      on conflict do nothing~, $post_id
    );
  }
  catch ($e) {
    die $e;
  }
}

async sub update_draft_p ($self, $post_id, $fields) {
  die "no rights"
    unless $self->_can_update_post((await $self->db->select_p('posts', 'user_id', {id => $post_id}))->hashes->first);

  my %fields = map { $_ => $fields->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw(title document picture_wp picture_pre)
  } keys %$fields;

  $fields{document} = {-json => $fields{document}} if exists $fields{document};

  await $self->db->update_p('post_drafts', \%fields, {post_id => $post_id});
}

async sub apply_changes_p ($self, $post_id, $meta) {
  die "no rights"
    unless $self->_can_update_post((await $self->db->select_p('posts', 'user_id', {id => $post_id}))->hashes->first);

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
  $tx->commit;
  return 1;
}


async sub link_upload_to_post_p($self, $post_id, $upload_path) {
  await $self->db->insert_p('post_uploads', {post_id => $post_id, path => $upload_path}, {on_conflict => undef});
}

async sub update_post_p($self, $post_id, $update_fields) {
  my $post = await $self->find_p($post_id);
  die "This user can't update post" unless $self->_can_update_post($post);

  my %post_values = map { $_ => $update_fields->{$_} } grep { is_updatable_field($_) } keys %$update_fields;
  die 'invalid values' unless %post_values;

  $post_values{document} = {-json => $post_values{document}} if exists $post_values{document};

  $post_values{modified_at}  = \'now()';
  $post_values{deleted_at}   = \'now()' if $post_values{status} eq 'del';
  $post_values{published_at} = \'now()' if $post_values{status} eq 'pub';

  await $self->update_p('posts', \%post_values, {id => $post_id});
}

sub _can_read_post($self, $post) {
  return 1 if $post->{status} eq POST_STATUS_PUB;

  my $user = $self->current_user;
  return 1 if $post->{user_id} eq $user->{id};
  return 1 if $user->{role} eq USER_ROLE_OWNER;
  return undef;
}

sub _can_update_post($self, $post) {
  my $user = $self->current_user;
  return undef unless $user;
  return 1 if $user->{id} eq $post->{user_id} || $user->{role} eq USER_ROLE_OWNER;
  return undef;
}

sub _can_create_post($self) {
  my $user = $self->current_user;
  return undef unless $user;
  return undef if none { $_ eq $user->{role} } USER_ROLE_CREATOR, USER_ROLE_OWNER;
  return 1;
}

async sub create_draft_p($self) {
  die "This user can't create post" unless $self->_can_create_post;

  my $t = Time::Piece->new;
  $t = join ' ', ($t->mday, $t->monname);

  my $user_id = $self->current_user->{id};

  my $res = await $self->db->insert_p(
    'posts',
    {user_id   => $user_id, document => {-json => {type => 'doc', content => []}}, title => "Draft $t"},
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
