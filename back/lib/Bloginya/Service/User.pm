package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_VISITOR);

has 'db';
has 'redis';

async sub find_p($self, $uid) {
  my $res = await $self->db->select_p('users', undef, {id => $uid});
  return $res->expand->hashes->first;
}

async sub is_blog_has_users_p($self) {
  return !!(await $self->db->query_p('select exists (select 1 from users)'))->arrays->first->[0];
}

async sub find_or_create_by_google_id_p($self, $userinfo, $token) {
  my %user = (
    email           => $userinfo->{email},
    username        => (split(/@/, $userinfo->{email}))[0],
    google_id       => $userinfo->{id},
    google_token    => {-json => $token},
    google_userinfo => {-json => $userinfo},
  );

  my $tx = $self->db->begin;
  unless ((await $self->db->select_p('users', '1', {google_id => $user{google_id}}))->hashes->first) {
    $user{role} = (await $self->is_blog_has_users_p) ? USER_ROLE_VISITOR : USER_ROLE_OWNER;
  }

  my $user = (await $self->db->insert_p('users', \%user, {on_conflict => [['google_id'] => \%user], returning => 'id'}))
    ->hashes->first;

  $tx->commit;

  return $user->{id};
}


1;
