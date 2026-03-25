package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize decamelize);
use Scalar::Util qw(weaken);

use Bloginya::Plugin::Service::DiResolver;

use constant SERVICE_INSTANCE_CACHE_KEY => '_service_cache';

has 'dependencies';
has 'service_prefix';

has _class_cache => sub { {} };

sub register ($self, $app, $conf) {
  $self->dependencies($conf->{dependencies}     // {});
  $self->service_prefix($conf->{service_prefix} // 'se_');

  my @services = load_classes('Bloginya::Service');

  $app->helper(
    'service' => sub ($c, $name, @args) {
      $self->_service($c, $name, @args);
    }
  );
}

sub _service($self, $c, $name, @args) {
  # Initialize stash cache if not exists
  $c->stash(SERVICE_INSTANCE_CACHE_KEY, {}) unless $c->stash(SERVICE_INSTANCE_CACHE_KEY);
  my $cache = $c->stash(SERVICE_INSTANCE_CACHE_KEY);

  # Return cached instance if exists (per-request cache)
  my $cache_key = $name . (@args ? join(':', @args) : '');
  return $cache->{$cache_key} if exists $cache->{$cache_key};

  my $class = 'Bloginya::Service::' . camelize($name);
  if (my $class_cache = $self->_class_cache->{$name}) {
    my $instance = $class_cache->new(($self->_di($c, $class))[0]->@*, @args);
    $cache->{$cache_key} = $instance;
    weaken($cache->{$cache_key});  # Break circular reference
    return $instance;
  }

  my $di_args = $self->_di($c, $class);

  $self->_class_cache->{$name} = $class;

  my $instance = $class->new(@$di_args, @args);
  $cache->{$cache_key} = $instance;
  weaken($cache->{$cache_key});  # Break circular reference
  return $instance;
}

sub _di ($self, $c, $class) {
  my @args;

  if ($class->can('_di_resolver')) {
    push @args, _di_resolver => $self->_create_resolver($c);
  }

  \@args;
}

sub _create_resolver($self, $c) {
  Bloginya::Plugin::Service::DiResolver->new(
    plugin     => $self,
    controller => $c,
  );
}

1;
