package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize);

has 'di_tokens';

sub register ($self, $app, $conf) {
  $self->di_tokens($conf->{di_tokens} // []);

  my $services = load_classes('Bloginya::Service');

  $app->helper(
    'service' => sub ($c, $name, @args) {
      $c->log->debug('service: ' . $name);
      my $class = 'Bloginya::Service::' . camelize($name);
      return $class->new($self->_di($c, $class), @args);
    }
  );
}

sub _di ($self, $c, $class) {
  my @args;
  for ($self->di_tokens->@*) {
    push @args, $_ => $c->$_ if $class->can($_);
  }

  @args;
}

1;
