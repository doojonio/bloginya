package Bloginya::Plugin::CoolIO::DefaultSchemaList;

use Bloginya::Plugin::CoolIO::SchemaList;
use Bloginya::Util::UUID   qw(is_uuid);
use Bloginya::Util::CoolId qw(is_cool_id);
use Scalar::Util           qw(blessed looks_like_number);
use Ref::Util              qw(is_ref);

schema any => sub {
  1;
};

schema num => sub {
  looks_like_number($_[0]);
};

schema bool => sub {
  $_[0] == 0 || $_[0] == 1;
};

schema undef => sub {
  !defined($_[0]);
};

schema uuid => sub {
  is_uuid($_[0]);
};

schema str => sub {
  return if !defined($_[0]) || is_ref($_[0]);
  return if defined($_[1]) && length($_[0]) < $_[1];
  return if defined($_[2]) && length($_[0]) > $_[2];
  return 1;
};

schema sname => sub {
  $_[0] && length($_[0]) >= 3 && length($_[0]) <= 16;
};

schema cool_id => sub {
  is_cool_id($_[0]);
};

schema upload => sub {
  blessed($_[0]) && $_[0]->isa('Mojo::Upload');
};

1;
