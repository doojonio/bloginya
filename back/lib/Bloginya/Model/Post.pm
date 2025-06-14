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
  is_updatable_field
);

use constant {POST_STATUS_DRAFT => 'draft', POST_STATUS_PUB => 'pub', POST_STATUS_DEL => 'del',};

use constant UPDATABLE => qw(
  category_id
  document
  draft
  status
  title
  description
  priority
  picture_wp
  picture_pre
  enable_likes
  enable_comments
);

sub is_updatable_field ($field) {
  any { $_ eq $field } UPDATABLE;
}

1;
