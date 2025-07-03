package Bloginya::Service::Drive;
use Mojo::Base -base, -signatures, -async_await;

use File::Path    qw(make_path);
use Image::Magick ();
use List::Util    qw(max);
use MIME::Types   ();
use Time::Piece   ();
use UUID          qw(uuid4);

use constant SIZES => (
  {name => 'thumbnail', size => 150, square => 1},
  {name => 'medium',    size => 900},
  {name => 'large',     size => 1600},
);

has 'app';
has 'db';
has 'current_user';
has 'log';

has 'im' => sub { Image::Magick->new };
has 'mt' => sub { MIME::Types->new };

async sub put($self, $file_path, $extname) {
  $self->log->debug(qq/Putting file "$file_path" with extension "$extname"/);
  my $mtype = $self->mt->mimeTypeOf($extname);
  $self->log->trace(qq/Detected MIME type: / . ($mtype // 'none'));
  if (!$mtype || $mtype !~ /^image/) {
    $self->log->warn(qq/File rejected: not an image (type: / . ($mtype // 'unknown') . ')');
    die 'not image';
  }

  my $t = Time::Piece->new();
  my ($year, $month, $day) = ($t->year, $t->mon, $t->mday);

  my $file = Mojo::File->new($file_path);

  my $uuid = uuid4;
  my $dir  = $self->app->home->child('public', 'drive', $year, $month, $day, $uuid);
  $self->log->trace(qq/Creating directory for upload: "$dir"/);
  $dir->make_path;

  my $path = $dir->child("original.$extname");
  $file = $file->copy_to($path);
  $self->log->trace(qq/Copied original to "$path"/);

  my $var_paths = $self->_generate_diff_sizes($path, $dir);

  my sub _path {
    (split /public\//, shift)[-1];
  }

  my %files
    = (original => _path($path), original_type => $mtype, map { $_ => _path($var_paths->{$_}) } keys %$var_paths,);

  # TODO FIX SHIT WITH GIF
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

  $self->log->info(qq/Successfully stored file with id "$id"/);
  return $id, \%files;
}

sub _generate_diff_sizes($self, $file_path, $dir) {
  my $im = $self->im;
  $self->log->debug(qq/Generating variants for "$file_path"/);

  # By appending "[0]", we instruct Image::Magick to read only the first frame.
  # This is crucial for handling animated GIFs without loading all frames into
  # memory, which prevents Out-Of-Memory (OOM) errors.
  $im->Read($file_path . '[0]');

  my ($orig_width, $orig_height) = $im->Get('width', 'height');
  $self->log->trace(qq/Original image dimensions: ${orig_width}x${orig_height}/);
  my $reduce_width = $orig_width > $orig_height;

  my %paths;
  for my $size (SIZES) {
    my $px_size = $size->{size};

    # Skip creating a variant if the original is already smaller than the target size.
    if (max($orig_width, $orig_height) < $px_size) {
      $self->log->trace("Skipping '$size->{name}' variant, original is smaller than $px_size px");
      next;
    }

    my $variant = $im->Clone();
    my $max     = $px_size;

    if ($size->{square}) {

      # For square variants, resize to fill a square area and then center-crop.
      $variant->Resize("${max}x${max}^");
      $variant->Set(gravity => 'Center');
      $variant->Extent(geometry => "${max}x${max}");
    }
    else {
      # For other sizes, just do a proportional resize.
      if ($reduce_width) {
        $variant->Resize($max . 'x');
      }
      else {
        $variant->Resize('x' . $max);
      }
    }

    $variant->Set(magick => 'webp');
    my $path = $dir->child($size->{name} . '.webp');
    $self->log->trace(qq/Writing '$size->{name}' variant to "$path"/);
    $variant->Write($path);

    $paths{$size->{name}} = $path;
  }

  return \%paths;
}

1;
