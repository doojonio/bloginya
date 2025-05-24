package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

has db    => undef;
has redis => undef;

async sub find_p($self, $uid) {
  return (await $self->db->select_p('users', '*', {id => $uid}))->expand->hash;
}

1;
