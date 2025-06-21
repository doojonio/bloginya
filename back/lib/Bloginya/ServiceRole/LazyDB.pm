package Bloginya::ServiceRole::LazyDB;

use Role::Tiny;

around db => sub {
  my ($orig, $self) = @_;
  $orig->($self)->();
};

1;
