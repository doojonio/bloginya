package Bloginya::Util::UUID;
use Mojo::Base -strict, -signatures;

use Exporter qw(import);

our @EXPORT_OK = qw(is_uuid);

sub is_uuid ($uuid) {
  return $uuid && $uuid =~ m/^[0-9a-f]{8}
                -[0-9a-f]{4}
                -[1-5][0-9a-f]{3}
                -[89abAB][0-9a-f]{3}
                -[0-9a-f]{12}$/x;
}

