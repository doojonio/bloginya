package Bloginya::Model::Upload;

use strict;
use warnings;

use Exporter qw(import);

use experimental 'signatures';

our @EXPORT_OK = qw(
  upload_id
);

sub upload_id($path) {
  (split(/\?/, $path))[0];
}

1;
