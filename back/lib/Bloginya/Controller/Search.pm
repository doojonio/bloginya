package Bloginya::Controller::Search;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub search($self) {
  my $q       = $self->i(query => 'str');
  my $results = await $self->service('search')->search_p($q);
  return $self->render(json => $results);
}

1
