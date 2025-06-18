package Bloginya::Model::Upload;

use strict;
use warnings;

use Exporter qw(import);

use experimental 'signatures';

our @EXPORT_OK = qw(
  large_variant
  medium_variant
  thumbnail_variant
);

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
