package Bloginya::Model::ProseMirror;

use strict;
use warnings;

use experimental qw(signatures);

use Exporter  qw(import);
use Ref::Util qw(is_hashref);

our @EXPORT_OK = qw(
  is_image
  is_text
);

sub is_image($el) {
  is_hashref($el) && $el->{type} eq 'image';
}

sub is_text($el) {
  is_hashref($el) && $el->{type} eq 'text' && defined($el->{text});
}

1;
