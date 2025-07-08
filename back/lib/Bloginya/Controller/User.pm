package Bloginya::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub block($self) {
  my $id = $self->i(id => 'uuid');
  try {
    await $self->service('block')->block_p($id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      return $self->msg('NORIGHT', 403);
    }
    else {
      die $e;
    }
  }
  return $self->msg('OK');
}


1
