package Bloginya::Controller::Shortname;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub get_by_name ($self) {
  return $self->msg('invalid', 400) unless my $name = $self->param('name');
  return $self->render(json => (await $self->service('shortname')->find_p($name)));
}


1
