package Bloginya::Controller::Shortname;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub get_by_name ($self) {
  my $name = $self->i(name => 'sname');
  return $self->render(json => (await $self->service('shortname')->find_p($name)));
}


1
