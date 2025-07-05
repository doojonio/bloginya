package Bloginya::Service::Drive;
use Mojo::Base -base, -signatures, -async_await;

use File::Path               qw(make_path);
use Image::Magick            ();
use List::Util               qw(max);
use MIME::Types              ();
use Time::Piece              ();
use UUID                     qw(uuid4);
use Mojo::IOLoop::Subprocess ();

use constant SIZES => {'thumbnail' => {size => 40, square => 1}, 'medium' => {size => 480}, 'large' => {size => 1200}};
use constant SUBP  => 'Mojo::IOLoop::Subprocess';

has 'app';
has 'db';
has 'current_user';
has 'log';

has 'im' => sub { Image::Magick->new };
has 'mt' => sub { MIME::Types->new };


async sub get_or_create_variant_p($self, $upload_id, $dimension) {
  $self->log->trace("Looking in dir public/drive/$upload_id");
  my $dir = $self->app->home->child('public', 'drive', $upload_id);

  my $file = $dir->list->first(qr/original/);
  die 'not found' unless defined $file && -e $file;

  return $file if $dimension eq 'original';

  my $orig = $file;
  $file = $dir->child($dimension . '.webp');

  unless (-e $file) {
    my $any_ext = $dir->list->first(qr/$dimension/);
    $file = $any_ext if $any_ext;
  }

  unless (-e $file) {
    my $subp = SUBP->new;
    $file = await $subp->run_p(sub { $self->_create_variant($orig, $dimension) });
  }

  die "Unexpected error" unless $file;

  return $file;
}

sub _create_variant ($self, $orig, $dimension) {
  my $im = $self->im;
  $self->log->debug(qq/Generating variant for "$orig"/);

  # By appending "[0]", we instruct Image::Magick to read only the first frame.
  # This is crucial for handling animated GIFs without loading all frames into
  # memory, which prevents Out-Of-Memory (OOM) errors.
  $im->Read($orig . '[0]');

  my ($orig_width, $orig_height) = $im->Get('width', 'height');
  $self->log->trace(qq/Original image dimensions: ${orig_width}x${orig_height}/);
  my $reduce_width = $orig_width > $orig_height;

  my $size    = SIZES->{$dimension};
  my $px_size = $size->{size};

  # my $new_file = $orig->dir->child($dimension);

  # Skip creating a variant if the original is already smaller than the target size.
  if (max($orig_width, $orig_height) < $px_size) {
    $self->log->trace("Linking '$dimension' variant, original is smaller than $px_size px");
    my $var = $orig->dirname->child($dimension . '.' . $orig->extname);
    symlink($orig, $var);
    return $var;
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
  my $path = $orig->dirname->child($dimension . '.webp');
  $self->log->trace(qq/Writing '$dimension' variant to "$path"/);
  $variant->Write($path);

  return $path;
}


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

  my sub _path {
    (split /public\//, shift)[-1];
  }

  my $id = _path($dir);
  await $self->db->insert_p('uploads', {id => $id, user_id => $self->current_user->{id}, mtype => $mtype,},);

  $self->log->info(qq/Successfully stored file with id "$id"/);
  return $id;
}

1;
