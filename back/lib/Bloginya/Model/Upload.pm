package Bloginya::Model::Upload;

use strict;
use warnings;

use Exporter qw(import);

use experimental 'signatures';

our @EXPORT_OK = qw(
  large_variant
  medium_variant
  thumbnail_variant
  upload_id
);

sub upload_id($path) {
  my @parts = split /\//, $path;
  die 'invalid path' if @parts < 5;
  join('/', @parts[qw(0 1 2 3 4)]);
}

sub large_variant ($t = 'uploads') {
  return \"coalesce($t.large, $t.original)";
}

sub medium_variant ($t = 'uploads') {
  return \"coalesce($t.medium, $t.original)";
}

sub thumbnail_variant ($t = 'uploads') {
  return \"coalesce($t.thumbnail, $t.original)";
}

1;
