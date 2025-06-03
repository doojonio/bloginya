package Bloginya::Service::Session;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'redis';

async sub create_session_p($self, $user_id, $ip, $user_agent) {
  my $sid
    = (await $self->db->insert_p('sessions', {user_id => $user_id, ip => $ip, app => $user_agent}, {returning => 'id'}))
    ->hash->{id};

  # Store user in cache for future requests
  await $self->redis->set_p('sid_user:' . $sid, $user_id);

  return $sid;
}

async sub uid_by_sid_p($self, $sid) {

  # Try to get user from cache
  my $uid = await $self->redis->get_p('sid_user:' . $sid);
  return $uid if $uid;

  # If not in cache, get from database
  $uid = (await $self->db->query_p(
    'SELECT users.id FROM users
        JOIN sessions ON users.id = sessions.user_id
        WHERE sessions.id = (?)', $sid
  ))->hash->{id};
  return unless $uid;

  # Store user in cache for future requests
  await $self->redis->set_p('sid_user:' . $sid, $uid);

  return $uid;
}

async sub update_ip_ua_p($self, $sid, $ip, $user_agent) {
  my $res = await $self->db->update_p('sessions', {ip => $ip, app => $user_agent, used_at => \'now()'}, {id => $sid},);
  return $res->rows;
}

# Todo use
async sub is_suspicious_activity_p($self, $ip, $user_agent) {
  my $result = await $self->db->query_p(
    'SELECT COUNT(*) FROM sessions
        WHERE ip = (?) AND app = (?) AND created_at > now() - interval \'1 hour\'', $ip, $user_agent
  );
  my $count = $result->hash->{count};

  # If there are more than 5 sessions with the same ip and user_agent in the last hour, consider it suspicious
  return $count > 5;
}

# TODO use
async sub is_sid_hijacked_p($self, $sid, $user_agent) {
  my $result = await $self->db->query_p(
    'SELECT COUNT(*) FROM sessions
        WHERE id = (?) AND app != (?)', $sid, $user_agent
  );
  my $count = $result->hash->{count};

  # If there are any sessions with the same sid but different user_agent, consider it suspicious
  return $count > 0;
}


1
