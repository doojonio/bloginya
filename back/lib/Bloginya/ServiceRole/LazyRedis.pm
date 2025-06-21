package Bloginya::ServiceRole::LazyRedis;

use Role::Tiny;

around redis => sub {
  my ($orig, $self) = @_;
  $orig->($self)->();
};

1;
