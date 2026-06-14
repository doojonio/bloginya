package Bloginya::Service::Subscription;
use Mojo::Base 'Bloginya::Plugin::Service::Base', -signatures, -async_await;
use Bloginya::Plugin::Service::Util;

use Bloginya::Model::User qw(USER_ROLE_OWNER);

inject 'config';
inject 'db';
inject 'current_user';
inject 'log';
inject 'metrics';

async sub subscribe_p ($self, $user_id = undef) {
  $user_id //= $self->current_user->{id};
  die 'not authorized' unless $user_id;

  await $self->db->update_p(
    'subscribers',
    {subscribed => 1, updated_at => \'now()'},
    {user_id => $user_id}
  );

  $self->log->info("User $user_id subscribed to notifications");
  $self->metrics->inc('bloginya_subscriptions_total', {action => 'subscribe'});
  return 1;
}

async sub unsubscribe_p ($self, $user_id = undef) {
  $user_id //= $self->current_user->{id};
  die 'not authorized' unless $user_id;

  await $self->db->update_p(
    'subscribers',
    {subscribed => 0, updated_at => \'now()'},
    {user_id => $user_id}
  );

  $self->log->info("User $user_id unsubscribed from notifications");
  $self->metrics->inc('bloginya_subscriptions_total', {action => 'unsubscribe'});
  return 1;
}

async sub unsubscribe_by_secret_p ($self, $secret) {
  my $res = await $self->db->update_p(
    'subscribers',
    {subscribed => 0, updated_at => \'now()'},
    {unsubscribe_secret => $secret},
    {returning => 'user_id'}
  );

  my $row = $res->hashes->first;
  unless ($row) {
    $self->log->warn("Invalid unsubscribe secret: $secret");
    die 'invalid secret';
  }

  $self->log->info("User $row->{user_id} unsubscribed via secret");
  $self->metrics->inc('bloginya_subscriptions_total', {action => 'unsubscribe'});
  return 1;
}

async sub get_status_p ($self, $user_id = undef) {
  $user_id //= $self->current_user->{id};
  die 'not authorized' unless $user_id;

  my $res = await $self->db->select_p(
    'subscribers',
    ['subscribed'],
    {user_id => $user_id}
  );

  my $row = $res->hashes->first;
  return {subscribed => $row ? $row->{subscribed} : 0};
}

sub get_unsubscribe_url ($self, $secret) {
  my $site_url = $self->config->{site_url};
  return sprintf('%s/api/subscription/unsubscribe/%s', $site_url, $secret);
}

async sub ensure_subscriber_p ($self, $user_id) {
  my $secret = $self->_generate_secret();

  await $self->db->insert_p(
    'subscribers',
    {
      user_id => $user_id,
      unsubscribe_secret => $secret,
      subscribed => 1,
    },
    {on_conflict => undef}
  );

  $self->log->debug("Ensured subscriber entry for user $user_id");
  return 1;
}

async sub admin_enable_p ($self, $user_id) {
  die 'not authorized' unless $self->_is_admin();

  await $self->db->update_p(
    'subscribers',
    {subscribed => 1, updated_at => \'now()'},
    {user_id => $user_id}
  );

  $self->log->info("Admin enabled subscription for user $user_id");
  return 1;
}

async sub admin_disable_p ($self, $user_id) {
  die 'not authorized' unless $self->_is_admin();

  await $self->db->update_p(
    'subscribers',
    {subscribed => 0, updated_at => \'now()'},
    {user_id => $user_id}
  );

  $self->log->info("Admin disabled subscription for user $user_id");
  return 1;
}

async sub admin_list_p ($self, $filters = {}) {
  die 'not authorized' unless $self->_is_admin();

  my %where;
  if (exists $filters->{subscribed}) {
    $where{'s.subscribed'} = $filters->{subscribed};
  }

  my $res = await $self->db->select_p(
    [\'subscribers s', [\'users u', 'u.id' => 's.user_id']],
    [
      's.user_id',
      'u.username',
      'u.email',
      's.subscribed',
      's.created_at',
      's.updated_at',
    ],
    keys %where ? \%where : undef,
    {order_by => {-desc => 's.updated_at'}}
  );

  return $res->hashes;
}

sub _is_admin ($self) {
  my $user = $self->current_user;
  return 0 unless $user;
  return $user->{role} eq USER_ROLE_OWNER || $user->{role} eq 'creator';
}

sub _generate_secret ($self) {
  my @chars = ('a'..'z', 'A'..'Z', '0'..'9');
  my $secret = '';
  $secret .= $chars[rand @chars] for 1..64;
  return $secret;
}

1;
