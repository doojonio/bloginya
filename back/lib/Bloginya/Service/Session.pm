package Bloginya::Service::Session;
use Mojo::Base -base, -signatures, -async_await;

has db    => undef;
has redis => undef;

use constant {RDS_KEY_TMPL => 'saram:sessions:%s',};

async sub create_session_p($self, $user_id, $ip, $app_name = undef) {
  my ($sid)
    = (await $self->db->insert_p(
    'users_sessions', {user_id => $user_id, ip => $ip, app => $app_name}, {returning => 'id'}))->array->@*;
  await $self->redis->set_p(sprintf(RDS_KEY_TMPL, $sid), $user_id);
  return $sid;
}

1
