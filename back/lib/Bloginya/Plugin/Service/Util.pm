package Bloginya::Plugin::Service::Util;

use Mojo::BaseUtil ();

sub import {
  my ($class, $caller) = (shift, caller);
  Mojo::BaseUtil::monkey_patch($caller, 'service', sub { _service($caller, @_) });
  Mojo::BaseUtil::monkey_patch($caller, 'inject',  sub { _inject($caller, @_) });
}

sub _service {
  my ($class, $attr_name, $service_name) = @_;

  Mojo::BaseUtil::monkey_patch($class, $attr_name, sub {
    my $self = shift;
    my $cache_key = "_lazy_$attr_name";
    return $self->{$cache_key} if exists $self->{$cache_key};
    $self->{$cache_key} = $self->_di_resolver->resolve_service($service_name);
    return $self->{$cache_key};
  });
}

sub _inject {
  my ($class, $dep_name) = @_;

  Mojo::BaseUtil::monkey_patch($class, $dep_name, sub {
    my $self = shift;
    my $cache_key = "_lazy_dep_$dep_name";
    return $self->{$cache_key} if exists $self->{$cache_key};
    $self->{$cache_key} = $self->_di_resolver->resolve_dependency($dep_name);
    return $self->{$cache_key};
  });
}

1;
