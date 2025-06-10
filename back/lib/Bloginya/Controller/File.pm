package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;


async sub put_file($self) {
  return $self->msg('File is too big', 403) if $self->req->is_limit_exceeded;
  return $self->msg('Missing file',    400) unless my $file    = $self->param('file');
  return $self->msg('Missing post_id', 400) unless my $post_id = $self->param('post_id');

  my $db    = $self->db;
  my $drive = $self->service('drive');
  my $paths = await $drive->put($file);

  my $upload = await $db->insert_p(
    'uploads',
    {
      user_id        => (await $self->current_user_p)->{id},
      post_id        => $post_id,
      original_path  => $paths->{original},
      original_type  => $paths->{original_type},
      thumbnail_path => $paths->{thumbnail},
      medium_path    => $paths->{medium},
      large_path     => $paths->{large},
    },
    {returning => 'id'}
  );

  $self->render(json => $paths);
}

1
