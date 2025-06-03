package Bloginya::Plugin::WebHelpers;
use Mojo::Base 'Mojolicious::Plugin', -signatures, -async_await;
use List::Util qw(first);

sub register {
  my ($self, $app) = @_;

  $app->helper(
    'real_ip' => sub {
      my $phys_ip = $_[0]->tx->remote_address;

      if (my $fw = $_[0]->req->headers->header('X-Forwarded-For')) {
        my $ip = first { $_ ne $phys_ip } map {chomp} split /,/, $fw;

        return $ip if length($ip) >= 7;
      }

      return $phys_ip;
    }
  );

  $app->helper('user_agent' => sub { $_[0]->req->headers->header('User-Agent') });

  $app->helper(
    'set_sid' => sub ($self, $sid) {
      my ($name, $secure, $domain, $max_age) = @{$self->config->{sessions}}{qw(name secure domain max_age)};
      $self->cookie(
        $name => $sid,
        {
          max_age  => $max_age // 60 * 60,
          path     => '/',
          secure   => $secure // 1,
          domain   => $domain // $self->config->{site_name},
          httponly => 1,
          samesite => 'strict'
        }
      );
    }
  );

  $app->helper(
    'create_session_p' => async sub ($self, $user_id) {
      my $service = $self->service('session');
      my $sid     = await $service->create_session_p($user_id, $self->real_ip, $self->user_agent);

      $self->set_sid($sid);

      return $sid;
    }
  );

  $app->helper(
    'current_user_p' => async sub ($self) {
      my $cname = $self->config->{sessions}{name};
      my $sid   = $self->cookie($cname);

      return undef if !$sid;

      my $serv = $self->service('session');
      my $uid  = await $serv->uid_by_sid_p($sid);
      return undef unless $uid;

      await $serv->update_ip_ua_p($sid, $self->real_ip, $self->user_agent);

      my $userv = $self->service('user');

      return $userv->find_p($uid);
    }
  );
}

1;
