package Bloginya::Plugin::WebHelpers;
use Mojo::Base 'Mojolicious::Plugin', -signatures, -async_await;
use List::Util qw(first);

use constant {CURRENT_USER_STASH_NAME => '_current_user',};

sub register {
  my ($self, $app) = @_;

  $app->helper(
    'real_ip' => sub ($c) {
      my $phys_ip = $c->tx->remote_address;

      if (my $fw = $c->req->headers->header('X-Forwarded-For')) {
        my $ip = first { $_ ne $phys_ip } map {chomp} split /,/, $fw;

        return $ip if length($ip) >= 7;
      }

      return $phys_ip;
    }
  );

  $app->helper('user_agent' => sub ($c) { $c->req->headers->header('User-Agent') });

  $app->helper('msg' => sub ($c, $msg, $code = 200) { $c->render(status => $code, json => {message => $msg}) });

  $app->helper(
    'set_sid' => sub ($c, $sid) {
      my ($name, $secure, $domain, $max_age) = @{$c->config->{sessions}}{qw(name secure domain max_age)};
      $c->cookie(
        $name => $sid,
        {
          max_age  => $max_age // 60 * 60,
          path     => '/',
          secure   => $secure // 1,
          domain   => $domain // $c->config->{site_name},
          httponly => 1,
          samesite => 'strict'
        }
      );
    }
  );

  $app->helper(
    'create_session_p' => async sub ($c, $user_id) {
      my $service = $c->service('session');
      my $sid     = await $service->create_session_p($user_id, $c->real_ip, $c->user_agent);

      $c->set_sid($sid);

      return $sid;
    }
  );

  $app->helper(
    'current_user_p' => async sub ($c) {
      return $c->stash(CURRENT_USER_STASH_NAME) if exists $c->stash->{&CURRENT_USER_STASH_NAME};

      my $user_p = async sub {
        my $cname = $c->config->{sessions}{name};
        my $sid   = $c->cookie($cname);

        return undef if !$sid;

        my $serv = $c->service('session');
        my $uid  = await $serv->uid_by_sid_p($sid);
        return undef unless $uid;

        await $serv->update_ip_ua_p($sid, $c->real_ip, $c->user_agent);

        my $userv = $c->service('user');

        await $userv->find_p($uid);
      };

      my $user = await $user_p->();
      $c->stash(CURRENT_USER_STASH_NAME, $user);
      return $user;

    }
  );

  $app->helper(
    'current_user' => sub ($c) {
      die 'No current user fetched' unless exists $c->stash->{&CURRENT_USER_STASH_NAME};
      return $c->stash(CURRENT_USER_STASH_NAME);
    }
  );
}

1;
