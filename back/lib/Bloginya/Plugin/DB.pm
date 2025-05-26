package Bloginya::Plugin::DB;
use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Mojo::Pg    ();
use Mojo::Redis ();

sub register {
  my ($self, $app) = @_;

  $app->helper(
    'pg' => sub ($self) {
      state $pg = Mojo::Pg->new($self->config->{db}{pg_dsn});
      $pg->on('connection', sub { $self->log->debug('New pg connection') });
      return $pg;
    }
  );
  $app->helper('mig' => sub ($self) { $self->pg->migrations->from_file($self->app->home->child(qw(db pgmig.sql))) });
  $app->helper('db'  => sub ($self) { $self->pg->db });

  $app->helper('redis_pool' => sub { state $rds = Mojo::Redis->new($_[0]->config->{db}{redis_dsn}) });
  $app->helper('redis'      => sub { $_[0]->redis_pool->db });

  $app->mig->migrate;
}

1;
