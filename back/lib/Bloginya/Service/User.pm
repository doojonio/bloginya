package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_VISITOR);
use Bloginya::Model::Post qw(POST_STATUS_PUB);

has 'db';
has 'redis';

async sub find_p($self, $uid) {
  my $res = await $self->db->select_p('users', undef, {id => $uid});
  return $res->expand->hashes->first;
}

async sub is_blog_has_users_p($self) {
  return !!(await $self->db->query_p('select exists (select 1 from users)'))->arrays->first->[0];
}

async sub is_username_taken_p ($self, $username) {
  my $res = await $self->db->select_p('users', 'id', {username => $username});
  return ($res->hashes->first // {})->{id};
}

async sub find_or_create_by_google_id_p($self, $userinfo, $token) {
  my %user = (
    email           => $userinfo->{email},
    username        => (split(/@/, $userinfo->{email}))[0],
    google_id       => $userinfo->{id},
    google_token    => {-json => $token},
    google_userinfo => {-json => $userinfo},
  );

  my %on_conflict = %user;
  delete $on_conflict{username};

  my $tx = $self->db->begin;
  unless ((await $self->db->select_p('users', '1', {google_id => $user{google_id}}))->hashes->first) {
    $user{role} = (await $self->is_blog_has_users_p) ? USER_ROLE_VISITOR : USER_ROLE_OWNER;
  }

  my $user
    = (await $self->db->insert_p('users', \%user, {on_conflict => [['google_id'] => \%on_conflict], returning => 'id'}))
    ->hashes->first;

  $tx->commit;

  return $user->{id};
}


async sub load_profile_p($self, $id) {
  my $user = (await $self->db->select_p(
    'users',
    ['id', 'username', 'created_at', [\"google_userinfo->>'picture'" => 'picture'], 'status', 'role'],
    {id => $id}
  ))->hashes->first;

  die 'user not found' unless $user;

  # with tags and description
  my $posts = (await $self->db->select_p(
    [\'posts p', [-left => \'shortnames sn', 'p.id' => 'sn.post_id']],
    [
      'p.id',
      'sn.name',
      'p.title',
      'p.picture_pre',
      'p.created_at',
      'p.description',
      [
        \'(
        select
          coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from post_tags pt join tags t on t.id = pt.tag_id
        where pt.post_id = p.id
      )' => 'tags'
      ]
    ],
    {'p.user_id' => $id,                       'p.status' => POST_STATUS_PUB},
    {order_by    => {-desc => 'p.created_at'}, limit      => 5}
  ))->hashes;

  my $comments = (await $self->db->select_p(
    [\'comments c', [-left => \'posts p', 'c.post_id' => 'p.id'], [-left => \'shortnames sn', 'p.id' => 'sn.post_id']],
    ['c.id', 'c.post_id', ['sn.name' => 'post_name'], ['p.title' => 'post_title'], 'c.content', 'c.created_at'],
    {'c.user_id' => $id,                       'c.status' => 'ok'},
    {order_by    => {-desc => 'c.created_at'}, limit      => 5}
  ))->hashes;

  $user->{posts}    = $posts;
  $user->{comments} = $comments;

  return $user;
}

1;
