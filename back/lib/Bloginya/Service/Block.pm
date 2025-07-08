package Bloginya::Service::Block;
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


1;
