package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;


sub put_file($self) {
  return $self->render(json => {message => 'File is too big.'}, status => 403) if $self->req->is_limit_exceeded;
  return $self->render(json => {message => 'Missing file'}, status => 400) unless my $file = $self->param('file');

  my $drive = $self->service('drive');
  my $path  = $drive->put($file);

  $self->render(json => {path => $path});
}

1
