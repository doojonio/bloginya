package Bloginya::Schema::Drive;
use Bloginya::Plugin::CoolIO::SchemaList;

use Bloginya::Model::Upload qw(SIZES);
use List::Util              qw(any);

schema 'dimension' => sub {
  any { $_ eq $_[0] } keys(SIZES->%*);
};

schema 'path' => sub {
  $_[0] !~ /\.\./;
};

1;
