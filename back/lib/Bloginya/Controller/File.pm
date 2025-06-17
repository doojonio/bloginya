package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;


async sub put_file($self) {
  return $self->msg('File is too big', 403) if $self->req->is_limit_exceeded;

  my ($file, $post_id) = $self->i('file' => 'upload', 'post_id' => 'cool_id',);

  my $db    = $self->db;
  my $drive = $self->service('drive');
  my $paths = await $drive->put($file);

  await $self->service('post')->link_upload_to_post_p($post_id, $paths->{path});
  $self->render(json => $paths);
}

1
