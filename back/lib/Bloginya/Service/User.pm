package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

has db    => undef;
has redis => undef;

async sub find_p($self, $uid) {
  my $res = await $self->db->select_p('users', undef, {id => $uid});
  return $res->expand->hashes->first;
}

1;
