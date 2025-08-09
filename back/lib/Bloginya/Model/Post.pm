package Bloginya::Model::Post;

use strict;
use warnings;

use Exporter     qw(import);
use experimental qw(signatures);

use List::Util qw(any);

our @EXPORT_OK = qw(
  POST_STATUS_DRAFT
  POST_STATUS_PUB
  POST_STATUS_DEL
  POST_STATUS_PRIVATE
);

use constant {
  POST_STATUS_DRAFT   => 'draft',
  POST_STATUS_PUB     => 'pub',
  POST_STATUS_DEL     => 'del',
  POST_STATUS_PRIVATE => 'private'
};

1;
