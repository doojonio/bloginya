package Bloginya::Model::User;

use strict;
use warnings;

use Exporter qw(import);

our @EXPORT_OK = qw(
  USER_ROLE_OWNER
  USER_ROLE_CREATOR
  USER_ROLE_VISITOR
);

use constant {USER_ROLE_OWNER => 'owner', USER_ROLE_CREATOR => 'creator', USER_ROLE_VISITOR => 'visitor',};

1;
