package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize decamelize);

use Ref::Util qw(is_arrayref);

has 'di_tokens';
has 'seen' => sub { {} };
has 'service_prefix';

has _class_cache => sub { {} };

sub register ($self, $app, $conf) {
  $self->di_tokens($conf->{di_tokens}           // []);
  $self->service_prefix($conf->{service_prefix} // 'se_');

  my @services = load_classes('Bloginya::Service');
  $self->_setup_serv_di_token($_) for @services;

  $app->helper(
    'service' => sub ($c, $name, @args) {
      $self->seen->%* = ();
      $self->_service($c, $name, @args);
    }
  );
}

sub _service($self, $c, $name, @args) {
  if ($self->seen->{$name}) {
    my @seen = keys($self->seen->%*);
    local $" = ',';
    die "circular service dependency: $name, seen: @seen";
  }

  $self->seen->{$name} = 1;

  my $class = 'Bloginya::Service::' . camelize($name);
  if (my $cache = $self->_class_cache->{$name}) {
    return $cache->new(($self->_di($c, $class))[0]->@*, @args);
  }


  my ($di_args, $roles) = $self->_di($c, $class);

  if (@$roles) {
    $class = $class->with_roles(@$roles);
  }

  $self->_class_cache->{$name} = $class;

  return $class->new(@$di_args, @args);
}

sub _di ($self, $c, $class) {
  my (@args, %service_roles);

  for my $token ($self->di_tokens->@*) {
    my ($insert_as, $helper, @roles) = ($token) x 2;
    if (is_arrayref($token)) {
      ($insert_as, $helper, @roles) = @$token;
    }

    next unless $class->can($insert_as);

    if (substr($insert_as, 0, length($self->service_prefix)) eq $self->service_prefix) {
      my $sname = substr($insert_as, length($self->service_prefix));
      push @args, $insert_as => $self->_service($c, $sname);
    }
    else {
      push @args, $insert_as => $c->$helper;
      $service_roles{$_} = 1 for @roles;
    }
  }

  \@args, [keys %service_roles];
}

sub _setup_serv_di_token($self, $serv) {
  my $name = $self->service_prefix . decamelize((split /::/, $serv)[-1]);
  push $self->di_tokens->@*, $name;
}

1;
