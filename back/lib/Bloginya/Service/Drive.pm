package Bloginya::Service::Drive;
use Mojo::Base -base, -signatures, -async_await;

use File::Path    qw( make_path );
use Image::Magick ();
use MIME::Types   ();
use Time::Piece   ();
use UUID          qw(uuid4);

use constant SIZES =>
  ({name => 'thumbnail', width => 300}, {name => 'medium', width => 900}, {name => 'large', width => 1600},);

has 'app';
has 'db';
has 'current_user';

has 'im' => sub { Image::Magick->new };
has 'mt' => sub { MIME::Types->new };

async sub put($self, $file_path, $extname) {
  my $mtype = $self->mt->mimeTypeOf($extname);
  if (!$mtype || $mtype !~ /^image/) {
    die 'not image';
  }

  my $t = Time::Piece->new();
  my ($year, $month, $day) = ($t->year, $t->mon, $t->mday);

  my $file = Mojo::File->new($file_path);

  my $dir = $self->app->home->child('public', 'drive', $year, $month, $day);
  $dir->make_path;
  my $id   = uuid4;
  my $path = $dir->child("$id.$extname");
  $file = $file->copy_to($path);

  # TODO if image
  my $var_paths = $self->_generate_diff_sizes($path, $dir->child($id)->make_path);

  my sub _path {
    (split /public\//, shift)[-1];
  }

  my %files = (path => _path($path), type => $mtype, map { $_ => _path($$var_paths{$_}) } keys %$var_paths,);

  await $self->db->insert_p(
    'uploads',
    {
      path           => $files{path},
      type           => $files{type},
      user_id        => $self->current_user->{id},
      thumbnail_path => $files{thumbnail},
      medium_path    => $files{medium},
      large_path     => $files{large},
    },
  );

  return \%files;
}

sub _generate_diff_sizes($self, $file_path, $dir) {
  my $im = $self->im;
  $im->Read($file_path);

  my $orig_width = $im->Get('width');
  my %paths;
  for my $size (SIZES) {
    my $width = $size->{width};
    next if $width > $orig_width;

    my $variant = $im->Clone();
    $variant->Resize($width . 'x');
    $variant->Set(magick => 'webp');
    my $path = $dir->child($size->{name} . '.webp');
    $variant->Write($path);

    $paths{$size->{name}} = $path;
  }

  return \%paths;
}

1;
