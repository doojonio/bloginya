package Bloginya::Controller::File;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Time::Piece ();
use UUID        qw(uuid4);
use File::Path  qw( make_path );

sub put_file($self) {
  return $self->render(json => {message => 'File is too big.'}, status => 403) if $self->req->is_limit_exceeded;
  return $self->render(json => {message => 'Missing file'}, status => 400) unless my $file = $self->param('file');

  my $ext = (split /\./, $file->filename)[-1] // '';
  $ext = '.' . $ext if $ext;

  my $t = Time::Piece->new();
  my ($year, $month, $day) = ($t->year, $t->mon, $t->mday);

  my $dir = $self->app->home->child('public', 'drive', $year, $month, $day);
  $dir->make_path;

  my $id   = uuid4;
  my $path = $dir->child($id . $ext);
  $file->move_to($path);

  $self->render(json => {path => (split /public\//, $path)[-1]});
}

1
