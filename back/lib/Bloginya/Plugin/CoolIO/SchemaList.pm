package Bloginya::Plugin::CoolIO::SchemaList;

use Ref::Util      qw(is_coderef is_arrayref is_hashref);
use Mojo::BaseUtil ();

sub import {
  my ($class, $caller) = (shift, caller);
  Mojo::BaseUtil::monkey_patch($caller, 'schema', sub { _schema($caller, @_) });
}

sub _schema {
  my ($class, $name, $cfg) = @_;

  $name = "schema_$name";

  if (is_coderef $cfg) {
    Mojo::BaseUtil::monkey_patch($class, $name, sub { $cfg->($_[1]) });
  }
  elsif (is_hashref($cfg) || is_arrayref($cfg)) {
    Mojo::BaseUtil::monkey_patch(
      $class, $name,
      sub {
        $_[0]->validate([[$_[1], $cfg]]);
      }
    );
  }
  else {
    die "invalid schema $name: $cfg";
  }
}

1;
