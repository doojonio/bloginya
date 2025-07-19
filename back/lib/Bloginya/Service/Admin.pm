package Bloginya::Service::Admin;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'redis';
has 'current_user';

async sub block_p($self, $user_id) {
  die 'no rights' unless my $u = $self->current_user;
  die 'no rights' if $u->{role} ne 'owner';

  my $user_to_ban = (await $self->db->select_p('users', ['role'], {id => $user_id}))->hashes->first;

  die 'no rights' if $user_to_ban->{role} eq 'owner';

  my $tx = $self->db->begin;

  await $self->db->update_p('users',    {status => 'blocked'}, {id      => $user_id});
  await $self->db->update_p('posts',    {status => 'del'},     {user_id => $user_id});
  await $self->db->update_p('comments', {status => 'blocked'}, {user_id => $user_id});

  $tx->commit;
}

# export interface GetUsersItem {
#   id: number;
#   username: string;
#   email: string;
#   role: UserRoles;
#   status: string;
#   picture: string | null;
#   comments_count: number;
#   posts_count: number;
#   likes_count: number;
#   created_at: string;
# }

async sub users_list_p($self) {
  die 'no rights' unless my $u = $self->current_user;
  die 'no rights' if $u->{role} ne 'owner';

  my $res = await $self->db->select_p(
    [\'users u'],
    [
      'u.id',
      'u.username',
      'u.email',
      'u.role',
      'u.status',
      [\"u.google_userinfo->>'picture'" => 'picture'],
      \'(select count(c.id) from comments c where c.user_id = u.id) as comments_count',
      \'(select count(p.id) from posts p where p.user_id = u.id) as posts_count',
      \'( (select count(cl.comment_id) from comment_likes cl where cl.user_id = u.id) + (select count(pl.post_id) from post_likes pl where pl.user_id = u.id) ) as likes_count',
      'u.created_at',
    ],
    undef,
    {order_by => {-desc => 'u.created_at'}}
  );

  return $res->hashes;
}


1;
