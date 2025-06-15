package Bloginya::Util::CoolId;
use Mojo::Base -strict, -signatures;

use Exporter qw(import);

our @EXPORT_OK = qw(is_cool_id);

sub is_cool_id ($id) {
  return length($id) == 12 && $id =~ /[a-zA-Z0-9]{12}/;
}


1
