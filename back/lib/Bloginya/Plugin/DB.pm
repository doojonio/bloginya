package Bloginya::Plugin::DB;
use Mojo::Base 'Mojolicious::Plugin', -signatures;

use Mojo::Pg    ();
use Mojo::Redis ();

use experimental qw(try);
use Scalar::Util qw(blessed);

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
  $app->helper(
    'db_disconnect' => sub ($c) {
      unless (exists $c->stash->{&DB_STASH_KEY()}) {
        return;
      }

      $c->log->trace('Disconnecting db');
      $c->db->disconnect;
    }
  );
  $app->helper(
    'db_lazy' => sub ($c, %args) {
      sub { $c->db(%args) }
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
  $app->helper(
    'redis_disconnect' => sub ($c) {
      unless (exists $c->stash->{&REDIS_STASH_KEY()}) {
        return;
      }

      $c->log->trace('Disconnecting redis');
      $c->redis->connection->disconnect;
    }
  );
  $app->helper(
    'redis_lazy' => sub ($c, %args) {
      sub { $c->redis(%args) }
    }
  );

  $app->hook(
    'around_action' => sub {
      my ($next, $c, $a, $last) = @_;

      my $res = $next->($c);

      return unless $last;

      my sub d {
        $c->db_disconnect;
        $c->redis_disconnect;
      }

      if (blessed($res) && $res->isa('Mojo::Promise')) {
        $res->finally(\&d);
      }
      else {
        d();
      }

      $res;
    }
  );

  $app->mig->migrate;
  $app->db_disconnect;
}

1;
