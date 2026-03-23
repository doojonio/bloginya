package Bloginya::Plugin::Service::DiResolver;
use Mojo::Base -base, -signatures;

has 'plugin';
has 'controller';

sub resolve_service ($self, $name, @args) {
  $self->plugin->_service($self->controller, $name, @args);
}

sub resolve_dependency ($self, $name) {
  die "Unknown dependency: $name" unless exists $self->plugin->dependencies->{$name};
  return $self->plugin->dependencies->{$name}->($self->controllker);
}

1;
