package Bloginya::Plugin::Metrics;
use Mojo::Base 'Mojolicious::Plugin', -signatures, -async_await;

use Prometheus::Tiny::Shared ();
use Time::HiRes    ();
use Mojo::Util     qw(b64_decode);

# Default histogram buckets (seconds) for HTTP request duration
my @DEFAULT_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10);

sub register ($self, $app, $conf) {
  # Store config for auth check (used by /api/metrics endpoint)
  my $config = $app->config->{metrics} // {};
  $app->helper('_metrics_config' => sub { $config });

  # Main metrics registry helper (shared across forked processes)
  $app->helper(
    'metrics' => sub {
      state $metrics = do {
        # TODO: use some memory location
        my $m = Prometheus::Tiny::Shared->new(filename => '/tmp/bloginya_metrics');

        # Declare default metrics with help text
        $m->declare('http_requests_total',               help => 'Total number of HTTP requests', type => 'counter');
        $m->declare('http_request_duration_seconds',     help => 'HTTP request duration in seconds', type => 'histogram', buckets => \@DEFAULT_BUCKETS);
        $m->declare('http_requests_in_flight',           help => 'Number of HTTP requests currently being processed', type => 'gauge');
        $m->declare('bloginya_drafts_created_total',     help => 'Total number of drafts created', type => 'counter');
        $m->declare('bloginya_posts_published_total',    help => 'Total number of posts published', type => 'counter');
        $m->declare('bloginya_posts_private_total',      help => 'Total number of posts set to private', type => 'counter');
        $m->declare('bloginya_comments_added_total',     help => 'Total number of comments added', type => 'counter');
        $m->declare('bloginya_file_uploads_total',       help => 'Total number of file uploads', type => 'counter');
        $m->declare('bloginya_oauth_logins_total',       help => 'Total number of OAuth logins', type => 'counter');
        $m->declare('bloginya_searches_total',           help => 'Total number of searches', type => 'counter');
        $m->declare('bloginya_post_reads_total',         help => 'Total number of post reads', type => 'counter');
        $m->declare('bloginya_likes_total',              help => 'Total number of likes', type => 'counter');
        $m->declare('bloginya_frontend_page_load_seconds', help => 'Frontend page load duration in seconds', type => 'histogram', buckets => [0.1, 0.25, 0.5, 1, 2, 5, 10]);
        $m->declare('bloginya_frontend_errors_total',    help => 'Total number of frontend errors', type => 'counter');
        $m->declare('bloginya_frontend_navigation_total', help => 'Total number of frontend navigations', type => 'counter');
        $m->declare('bloginya_post_read_seconds',         help => 'Time spent reading a post in seconds', type => 'histogram', buckets => [5, 15, 30, 60, 120, 300, 600]);
        $m->declare('bloginya_admin_user_blocks_total',   help => 'Total number of users blocked by admin', type => 'counter');
        $m->declare('bloginya_categories_created_total',  help => 'Total number of categories created', type => 'counter');
        $m->declare('bloginya_categories_updated_total',  help => 'Total number of categories updated', type => 'counter');
        $m->declare('bloginya_cleanup_sessions_deleted_total',  help => 'Total number of expired sessions deleted by cleanup', type => 'counter');
        $m->declare('bloginya_cleanup_files_deleted_total',     help => 'Total number of unused files deleted by cleanup', type => 'counter');
        $m->declare('bloginya_cleanup_posts_deleted_total',     help => 'Total number of soft-deleted posts purged by cleanup', type => 'counter');
        $m->declare('bloginya_cleanup_comments_deleted_total',  help => 'Total number of deleted comments purged by cleanup', type => 'counter');
        $m->declare('bloginya_email_notifications_sent_total',  help => 'Total number of email notifications sent', type => 'counter');
        $m->declare('bloginya_email_notification_errors_total', help => 'Total number of email notification send errors', type => 'counter');
        $m->declare('bloginya_sessions_created_total',    help => 'Total number of user sessions created', type => 'counter');
        $m->declare('bloginya_post_views_total',          help => 'Total number of post views by view type', type => 'counter');
        $m->declare('bloginya_subscriptions_total',       help => 'Total number of subscription changes', type => 'counter');
        $m->declare('bloginya_users_registered_total',    help => 'Total number of new users registered', type => 'counter');
        $m;
      };
    }
  );

  # Install HTTP metrics hooks
  $app->hook(
    'before_dispatch' => sub ($c) {
      $c->stash('_metrics_start' => Time::HiRes::time());
      $c->metrics->add('http_requests_in_flight', 1);
    }
  );

  $app->hook(
    'after_dispatch' => sub ($c) {
      eval {
        my $start = $c->stash('_metrics_start') // return;
        my $elapsed = Time::HiRes::time() - $start;

        my $method = $c->req->method;
        my $route  = $c->match->endpoint ? $c->match->endpoint->to_string : '';
        $route = $c->req->url->path->to_string unless length $route;
        my $status = $c->res->code // 200;

        my %labels = (method => $method, route => $route);
        $c->metrics->inc('http_requests_total', {%labels, status => $status});
        $c->metrics->histogram_observe('http_request_duration_seconds', $elapsed, \%labels);
        $c->metrics->add('http_requests_in_flight', -1);

        1;
      } or warn $@;
    }
  );

  # Register the /api/metrics endpoint
  $self->_setup_metrics_route($app, $config);
}

sub _setup_metrics_route ($self, $app, $config) {
  my $r = $app->routes;

  $r->get('/api/metrics')->to(
    cb => sub ($c) {
      # Basic auth check
      my $auth = $c->req->headers->authorization // '';
      unless ($self->_check_basic_auth($auth, $config)) {
        $c->res->headers->www_authenticate('Basic realm="metrics"');
        return $c->render(text => 'Unauthorized', status => 401);
      }

      # Render metrics using Prometheus::Tiny
      my $output = $c->metrics->format;
      $c->render(text => $output, format => 'txt');
      $c->res->headers->content_type('text/plain; version=0.0.4; charset=utf-8');
    }
  );
}

sub _check_basic_auth ($self, $header, $config) {
  my $ba = $config->{basic_auth} // return 0;
  return 0 unless $header =~ /^Basic\s+(.+)$/i;
  my $decoded = b64_decode($1) // return 0;
  my ($user, $pass) = split(/:/, $decoded, 2);
  return ($user // '') eq ($ba->{username} // '') && ($pass // '') eq ($ba->{password} // '');
}

1;
