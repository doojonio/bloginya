package Bloginya::Plugin::DB;
use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Mojo::Pg    ();
use Mojo::Redis ();

use constant {DB_STASH_KEY => '_db', REDIS_STASH_KEY => '_redis'};

sub register {
  my ($self, $app) = @_;

  $app->helper(
    'pg' => sub ($self) {
      state $pg = Mojo::Pg->new($self->config->{db}{pg_dsn});
      $pg->on(
        'connection',
        sub {
          $self->log->trace('New pg connection');
        }
      );
      return $pg;
    }
  );
  $app->helper('mig' => sub ($self) { $self->pg->migrations->from_file($self->app->home->child(qw(db pgmig.sql))) });
  $app->helper(
    'db' => sub ($self, %args) {
      return $self->pg->db if $args{nocache};

      $self->stash(DB_STASH_KEY, $self->pg->db) unless $self->stash(DB_STASH_KEY);
      $self->stash(DB_STASH_KEY);
    }
  );

  $app->helper('redis_pool' => sub { state $rds = Mojo::Redis->new($_[0]->config->{db}{redis_dsn}) });
  $app->helper(
    'redis' => sub ($self, %args) {
      return $self->redis_pool->db if $args{nocache};

      $self->stash(REDIS_STASH_KEY, $self->redis_pool->db) unless $self->stash(REDIS_STASH_KEY);
      $self->stash(REDIS_STASH_KEY);
    }
  );

  $app->mig->migrate;
}

1;
