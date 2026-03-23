package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize decamelize);

use Bloginya::Plugin::Service::DiResolver;

has 'dependencies';
has 'service_prefix';

has _class_cache => sub { {} };
has _instance_cache => sub { {} };

sub register ($self, $app, $conf) {
  $self->dependencies($conf->{dependencies}     // {});
  $self->service_prefix($conf->{service_prefix} // 'se_');

  my @services = load_classes('Bloginya::Service');

  $app->helper(
    'service' => sub ($c, $name, @args) {
      $self->_instance_cache->%* = ();
      $self->_service($c, $name, @args);
    }
  );
}

sub _service($self, $c, $name, @args) {
  # Return cached instance if exists (per-request cache)
  my $cache_key = $name . (@args ? join(':', @args) : '');
  return $self->_instance_cache->{$cache_key} if exists $self->_instance_cache->{$cache_key};

  my $class = 'Bloginya::Service::' . camelize($name);
  if (my $cache = $self->_class_cache->{$name}) {
    my $instance = $cache->new(($self->_di($c, $class))[0]->@*, @args);
    $self->_instance_cache->{$cache_key} = $instance;
    return $instance;
  }

  my $di_args = $self->_di($c, $class);

  $self->_class_cache->{$name} = $class;

  my $instance = $class->new(@$di_args, @args);
  $self->_instance_cache->{$cache_key} = $instance;
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
