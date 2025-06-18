package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub put_file($self) {
  return $self->msg('File is too big', 403) if $self->req->is_limit_exceeded;

  my ($file, $post_id) = $self->i('file' => 'upload', 'post_id' => 'cool_id',);

  my $db    = $self->db;
  my $drive = $self->service('drive');
  my $paths;

  return $self->msg('Invalid filename', 400) unless my $ext = Mojo::File->new($file->filename)->extname;


  my $file_asset = $file->asset->to_file;
  try {
    $paths = await $drive->put($file_asset->path, $ext);
  }
  catch ($e) {
    if ($e =~ /not image/) {
      return $self->msg('Not Image', 400);
    }
    else {
      die $e;
    }
  }

  await $self->service('post')->link_upload_to_post_p($post_id, $paths->{path});
  $self->render(json => $paths);
}

1
