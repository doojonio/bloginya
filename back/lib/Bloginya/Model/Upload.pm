package Bloginya::Model::Upload;

use strict;
use warnings;

use Exporter qw(import);

use experimental 'signatures';

our @EXPORT_OK = qw(
  upload_id
  SIZES
);

use constant SIZES => {
  'thumbnail' => {size => 40,   square  => 1, quality => 30},
  'pre140'    => {size => 140,  square  => 1, gifable => 1, quality => 60},
  'pre280'    => {size => 280,  square  => 1, gifable => 1, quality => 60},
  'pre450'    => {size => 450,  square  => 1, gifable => 1, quality => 60},
  'pre450_95' => {size => 450,  square  => 1, gifable => 1, quality => 95},
  'medium'    => {size => 880,  gifable => 1, quality => 95},
  'large'     => {size => 1600, gifable => 1, quality => 95}
};


sub upload_id($path) {
  (split(/\?/, $path))[0];
}

1;
