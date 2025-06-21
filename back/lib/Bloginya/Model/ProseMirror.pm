package Bloginya::Model::ProseMirror;

use strict;
use warnings;

use experimental qw(signatures);

use Exporter qw(import);

our @EXPORT_OK = qw(
  is_image
  is_text
);

sub is_image($el) {
  $el && $el->{type} eq 'image';
}

sub is_text($el) {
  $el && $el->{type} eq 'text' && defined($el->{text});
}

1;
