package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'redis';

async sub find_p($self, $uid) {
  my $res = await $self->db->select_p('users', undef, {id => $uid});
  return $res->expand->hashes->first;
}

async sub find_or_create_by_google_id_p($self, $userinfo, $token) {
  my %user = (
    email           => $userinfo->{email},
    username        => (split(/@/, $userinfo->{email}))[0],
    google_id       => $userinfo->{id},
    google_token    => {-json => $token},
    google_userinfo => {-json => $userinfo},
  );

  my $user
    = (await $self->db->insert_p('users', \%user, {on_conflict => [['google_id'] => \%user]}, {returning => 'id'}))
    ->hash;

  return $user;
}


1;
