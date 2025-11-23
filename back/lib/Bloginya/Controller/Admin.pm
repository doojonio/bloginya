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


async sub list_trash($self) {
  try {
    my $deleted_comments = await $self->service('comment')->list_deleted_comments();
    my $deleted_posts    = await $self->service('post')->list_deleted_posts();

    return $self->render(json => {deleted_comments => $deleted_comments, deleted_posts => $deleted_posts});
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      $self->msg('NORIGHT', 403);
    }
    else {
      die $_;
    }
  }
}


1
