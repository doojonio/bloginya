package Bloginya::Controller::Drive;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub get_file($self) {

  # FIXME: shibal for current user error
  $self->stash(_current_user => undef);
  my ($upload_id, $dimension) = $self->i(upload_id => 'path', d => 'dimension');

  # Default to 'original' if dimension is omitted
  $dimension //= 'original';

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

async sub register_external_audio($self) {
  my $api_key = $self->req->headers->header('X-API-Key') // '';

  # Find app by API key
  my $app_name = undef;
  my $apps = $self->app->config->{apps} // {};
  for my $name (keys %$apps) {
    if ($apps->{$name} eq $api_key) {
      $app_name = $name;
      last;
    }
  }

  unless ($app_name) {
    return $self->msg('Invalid API key', 401);
  }

  # Get user_id from session cookie
  my $user = await $self->current_user_p;
  unless ($user) {
    return $self->msg('Unauthorized', 401);
  }
  my $user_id = $user->{id};

  my $upload_id = $self->i(json => 'RegisterAudioPayload')->{upload_id};

  unless ($upload_id) {
    return $self->msg('upload_id is required', 400);
  }

  my $drive = $self->service('drive');

  try {
    await $drive->register_external_audio_p($upload_id, $app_name, $user_id);
  }
  catch ($e) {
    $self->log->error("Error registering external audio: $e");
    return $self->msg('Failed to register audio', 500);
  }

  return $self->render(json => {id => $upload_id});
}

1
