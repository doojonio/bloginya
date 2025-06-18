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

  my $dir = $self->app->home->child('public', 'drive', $year, $month, $day, uuid4);
  $dir->make_path;

  my $path = $dir->child("original.$extname");
  $file = $file->copy_to($path);

  my $var_paths = $self->_generate_diff_sizes($path, $dir);

  my sub _path {
    (split /public\//, shift)[-1];
  }

  my %files
    = (original => _path($path), original_type => $mtype, map { $_ => _path($var_paths->{$_}) } keys %$var_paths,);

  my $id = _path($dir);
  await $self->db->insert_p(
    'uploads',
    {
      id            => $id,
      user_id       => $self->current_user->{id},
      original_type => $files{original_type},
      original      => $files{original},
      thumbnail     => $files{thumbnail},
      medium        => $files{medium},
      large         => $files{large},
    },
  );

  return $id, \%files;
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

sub extract_upload_id($self, $path) {
  my @parts = split /\//, $path;
  die 'invalid path' if @parts < 5;
  join('/', @parts[qw(0 1 2 3 4)]);
}

1;
