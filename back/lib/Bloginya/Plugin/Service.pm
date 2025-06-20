package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize decamelize);

has 'di_tokens';

has 'seen' => sub { {} };

sub register ($self, $app, $conf) {
  $self->di_tokens($conf->{di_tokens} // []);

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
  $c->log->debug('service: ' . $name);

  if ($self->seen->{$name}) {
    my @seen = keys($self->seen->%*);
    local $" = ',';
    die "circular service dependency: $name, seen: @seen";
  }

  $self->seen->{$name} = 1;

  my $class = 'Bloginya::Service::' . camelize($name);
  return $class->new($self->_di($c, $class), @args);
}

sub _di ($self, $c, $class) {
  my @args;
  for my $token ($self->di_tokens->@*) {
    next unless $class->can($token);

    if (substr($token, 0, 2) eq 's_') {
      my $sname = substr($token, 2);
      push @args, $token => $self->_service($c, $sname);
    }
    else {
      push @args, $token => $c->$token;
    }
  }

  @args;
}

sub _setup_serv_di_token($self, $serv) {
  my $name = 's_' . decamelize((split /::/, $serv)[-1]);
  push $self->di_tokens->@*, $name;
}

1;
