package Bloginya::Controller::Drive;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub get_file($self) {

  # FIXME: shibal for current user error
  $self->stash(_current_user => undef);
  my ($upload_id, $dimension) = $self->i(upload_id => 'path', d => 'dimension');

  my $path;
  try {
    $path = await $self->service('drive')->get_or_create_variant_p($upload_id, $dimension);
  }
  catch ($e) {
    if ($e =~ /not found/) {
      warn "File not found";
      return $self->msg('Not Found', 404);
    }
    else {
      die $e;
    }
  }

  $path = (split(/\/public\//, $path))[1];
  $self->reply->static($path);
}


async sub put_file($self) {
  return $self->msg('File is too big', 403) if $self->req->is_limit_exceeded;

  my ($file, $post_id) = $self->i('file' => 'upload', 'post_id' => 'cool_id',);

  return $self->msg('Invalid filename', 400) unless my $ext = Mojo::File->new($file->filename)->extname;

  my $drive = $self->service('drive');

  my $id;
  my $paths;
  my $file_asset = $file->asset->to_file;
  try {
    $id = await $drive->put($file_asset->path, $ext);
  }
  catch ($e) {
    if ($e =~ /not image/) {
      return $self->msg('Not Image', 400);
    }
    else {
      die $e;
    }
  }

  await $self->service('post')->link_upload_to_post_p($post_id, $id);

  $self->render(json => {id => $id});
}

1
