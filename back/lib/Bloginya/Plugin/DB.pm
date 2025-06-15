package Bloginya::Plugin::DB;
use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Mojo::Pg    ();
use Mojo::Redis ();

use constant {DB_STASH_KEY => '_db', REDIS_STASH_KEY => '_redis'};

sub register {
  my ($self, $app) = @_;

  $app->helper(
    'pg' => sub ($c) {
      state $pg = Mojo::Pg->new($c->config->{db}{pg_dsn});
      $pg->on(
        'connection',
        sub {
          $c->log->trace('New pg connection');
        }
      );
      return $pg;
    }
  );
  $app->helper('mig' => sub ($c) { $c->pg->migrations->from_file($c->app->home->child(qw(db pgmig.sql))) });
  $app->helper(
    'db' => sub ($c, %args) {
      return $c->pg->db if $args{nocache};

      $c->stash(DB_STASH_KEY, $c->pg->db) unless $c->stash(DB_STASH_KEY);
      $c->stash(DB_STASH_KEY);
    }
  );

  $app->helper('redis_pool' => sub { state $rds = Mojo::Redis->new($_[0]->config->{db}{redis_dsn}) });
  $app->helper(
    'redis' => sub ($c, %args) {
      return $c->redis_pool->db if $args{nocache};

      $c->stash(REDIS_STASH_KEY, $c->redis_pool->db) unless $c->stash(REDIS_STASH_KEY);
      $c->stash(REDIS_STASH_KEY);
    }
  );

  $app->mig->migrate;
}

1;
