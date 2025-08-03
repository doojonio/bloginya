package Bloginya::Schema::Stat;
use Bloginya::Plugin::CoolIO::SchemaList;

use List::Util qw(any);

schema 'view_type' => sub {
  any { $_ eq $_[0] } qw(short medium long);
};

1;
