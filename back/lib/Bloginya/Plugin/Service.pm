package Bloginya::Plugin::Service;
use Mojo::Base 'Mojolicious::Plugin', -signatures;
use Mojo::Loader qw(load_classes);
use Mojo::Util   qw(camelize);

sub register {
  my ($self, $app) = @_;

  my $services = load_classes('Bloginya::Service');

  $app->helper(
    'service' => sub ($self, $name, @args) {
      my $class = 'Bloginya::Service::' . camelize($name);
      return $class->new(@args);
    }
  );
}

1;
