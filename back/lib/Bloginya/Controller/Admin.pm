package Bloginya::Controller::Admin;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub block($self) {
  my $id = $self->i(id => 'uuid');
  try {
    await $self->service('admin')->block_p($id);
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

async sub users_list($self) {
  my $users = await $self->service('admin')->users_list_p();
  return $self->render(json => $users);
}


1
