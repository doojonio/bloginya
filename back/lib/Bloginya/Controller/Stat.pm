package Bloginya::Controller::Stat;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub add_stat ($self) {
  my ($post_id, $view_type) = $self->i(post_id => 'cool_id', view_type => 'str');

  await $self->service('stat')->add_stat_p($post_id, $view_type);

  return $self->msg('OK');
}

async sub get_view_count ($self) {
  my $post_id = $self->i(post_id => 'cool_id');

  my $views;
  try {
    $views = await $self->service('stat')->get_views_p($post_id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      return $self->msg('NORIGHT', 403);
    }
    else {
      die $e;
    }
  }

  return $self->render(json => $views);
}


1
