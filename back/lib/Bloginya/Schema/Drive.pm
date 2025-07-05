package Bloginya::Schema::Drive;
use Bloginya::Plugin::CoolIO::SchemaList;

use List::Util qw(any);

schema 'dimension' => sub {
  any { $_ eq $_[0] } qw(thumbnail medium large original);
};

schema 'path' => sub {
  $_[0] !~ /\.\./;
};

1;
