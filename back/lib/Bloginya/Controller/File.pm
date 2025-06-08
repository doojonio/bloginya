package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;


async sub put_file($self) {
  return $self->render(json => {message => 'File is too big.'}, status => 403) if $self->req->is_limit_exceeded;
  return $self->render(json => {message => 'Missing file'}, status => 400) unless my $file = $self->param('file');

  my $db    = $self->db;
  my $drive = $self->service('drive');
  my $paths = await $drive->put($file);

  my $upload = await $db->insert_p(
    'uploads',
    {
      user_id        => (await $self->current_user_p)->{id},
      post_id        => $self->param('post_id'),
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
