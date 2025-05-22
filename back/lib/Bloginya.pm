package Bloginya;
use Mojo::Base 'Mojolicious', -signatures;

use Mojo::Pg    ();
use Mojo::Redis ();


sub startup ($self) {
  my $config = $self->plugin('NotYAMLConfig');
  $self->secrets($config->{secrets});

  # Default helpers
  $self->plugin('DefaultHelpers');

  # for files 1gb
  $self->max_request_size(1e+9);

  $self->_setup_db;
  $self->_setup_routes;
  $self->_setup_commands;

  $self->helper(
    real_ip => sub {
      if (my $fw = $_[0]->req->headers->header('X-Forwarded-For')) {
        my $ip = (map {chomp} split /,/, $fw)[0];

        return $ip if length($ip) >= 7;
      }

      return $_[0]->tx->remote_address;
    }
  );

  $self->helper(client_app => sub { $_[0]->req->headers->header('User-Agent') });

  $self->helper(
    'set_sid' => sub ($self, $sid) {
      my ($name, $secure, $httponly, $domain, $expires)
        = @{$self->config->{sessions}}{qw(cookie_name secure httponly domain expires)};

      my %conf = (
        name     => $name,
        value    => $sid,
        path     => '/',
        secure   => $secure,
        httponly => $httponly,
        domain   => $domain,

        # (expires => $secure) x !!$secure,
      );

      $self->res->cookies(\%conf);
    }
  );

  $self->helper(
    'current_user' => sub ($self) {
      p $self->req->cookies;
    }
  );

  $self->helper(test => sub ($self) { !!$self->config->{test} });
}

sub _setup_db($self) {
  $self->helper('pg'  => sub { state $pg = Mojo::Pg->new($_[0]->config->{db}{pg_dsn}) });
  $self->helper('mig' => sub { $self->pg->migrations->from_file($self->home->child(qw(db pgmig.sql))) });
  $self->helper('db'  => sub { $_[0]->pg->db });

  $self->helper('redis_pool' => sub { state $rds = Mojo::Redis->new($_[0]->config->{db}{redis_dsn}) });
  $self->helper('redis'      => sub { $_[0]->redis_pool->db });

  $self->mig->migrate;
}

sub _setup_routes($self) {
  my $r = $self->routes;
  $r->get('/')->to(cb => sub { $_[0]->render(json => {status => 'up'}) });

  my $api = $r->any('/api');

  $api->get('/oauth/to_google')->to('OAuth#to_google');
  $api->get('/oauth/from_google')->to('OAuth#from_google');

  $api->post('/drive')->to('File#put_file');

  $api->post('/blogs')->to('Blog#save');
  $api->get('/blogs')->to('Blog#get');
  $api->get('/blogs/list')->to('Blog#list');
  $api->post('/blogs/publish')->to('Blog#publish');

  $api->post('/collections')->to('Collection#save');
  $api->get('/collections/list')->to('Collection#list');
  $api->get('/collections')->to('Collection#get');
}

sub _setup_commands($self) {
  push $self->commands->namespaces->@*, 'Bloginya::Command';
}

1;
