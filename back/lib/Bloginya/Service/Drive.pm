package Bloginya::Service::Drive;
use Mojo::Base -base, -signatures, -async_await;

use Time::Piece ();
use File::Path  qw( make_path );
use UUID        qw(uuid4);

async sub put($self, $file) {
  my $ext = (split /\./, $file->filename)[-1] // '';
  $ext = '.' . $ext if $ext;

  my $t = Time::Piece->new();
  my ($year, $month, $day) = ($t->year, $t->mon, $t->mday);

  my $dir = $self->app->home->child('public', 'drive', $year, $month, $day);
  $dir->make_path;

  my $id   = uuid4;
  my $path = $dir->child($id . $ext);
  $file->move_to($path);

  return (split /public\//, $path)[-1];
}

1;
