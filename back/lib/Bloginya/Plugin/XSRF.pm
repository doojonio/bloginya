package Bloginya::Plugin::XSRF;
use Mojo::Base 'Mojolicious::Plugin', -signatures, -async_await;

use Mojo::Util qw(secure_compare b64_encode);

sub register {
  my ($self, $app, $config) = @_;

  # Default configuration
  $config //= {};
  my $cookie_name = $config->{cookie_name} // 'XSRF-TOKEN';
  my $header_name = $config->{header_name} // 'X-XSRF-TOKEN';
  my $cookie_path = $config->{cookie_path} // '/';
  my $cookie_secure = $config->{cookie_secure} // ($app->config->{sessions}{secure} // 1);
  my $cookie_samesite = $config->{cookie_samesite} // 'strict';
  # Use plugin config, then app config sessions.domain, then undef
  my $cookie_domain = $config->{cookie_domain} // $app->config->{sessions}{domain} // undef;
  my $cookie_max_age = $config->{cookie_max_age} // 60 * 60 * 24; # 24 hours
  my $excluded_methods = $config->{excluded_methods} // ['GET', 'HEAD', 'OPTIONS'];
  my $excluded_paths = $config->{excluded_paths} // [];

  # Helper to generate CSRF token
  $app->helper(
    'xsrf_token' => sub ($c) {
      # Access session to ensure it's initialized
      my $session = $c->session;

      my $token = $session->{xsrf_token};
      unless ($token) {
        my $seed = join('',
          $c->session->{_session_id} // '',
          time(),
          $$,
          rand(),
          rand(),
        );

        $token = Mojo::Util::sha1_sum($seed);
        $token = b64_encode($token, '');
        $session->{xsrf_token} = $token;
      }
      return $token;
    }
  );

  # Hook to set XSRF-TOKEN cookie on every response
  $app->hook(
    'after_dispatch' => sub ($c) {
      # Access session to ensure it's initialized
      my $session = $c->session;

      # Generate and set token if session exists
      if ($session) {
        my $token = $c->xsrf_token;
        $c->cookie(
          $cookie_name => $token,
          {
            path     => $cookie_path,
            secure   => $cookie_secure,
            samesite => $cookie_samesite,
            domain   => $cookie_domain,
            max_age  => $cookie_max_age,
            httponly => 0, # Angular needs to read this cookie
          }
        );
      }
    }
  );

  # Hook to validate XSRF token before state-changing requests
  $app->hook(
    'before_dispatch' => sub ($c) {
      my $method = $c->req->method;
      my $path   = $c->req->url->path->to_string;

      # Skip validation for excluded methods
      return if grep { $_ eq $method } @$excluded_methods;

      # Skip validation for excluded paths
      for my $excluded_path (@$excluded_paths) {
        return if $path =~ /^$excluded_path/;
      }

      # Get token from cookie
      my $cookie_token = $c->cookie($cookie_name);

      # Get token from header
      my $header_token = $c->req->headers->header($header_name);

      # Validate tokens
      unless ($cookie_token && $header_token) {
        $c->render(
          json   => {message => 'XSRF token missing'},
          status => 403
        );
        return;
      }

      # Use secure_compare to prevent timing attacks
      unless (secure_compare($cookie_token, $header_token)) {
        $c->render(
          json   => {message => 'XSRF token mismatch'},
          status => 403
        );
        return;
      }
    }
  );
}

1;
