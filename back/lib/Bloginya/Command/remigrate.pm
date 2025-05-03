package Bloginya::Command::remigrate;
use Mojo::Base 'Mojolicious::Command', -signatures;

use Mojo::Util qw(getopt);

has description => 'Migrate database to 0, then to head. Works only in test environment';
has usage       => sub ($self) { $self->extract_usage };

sub run ($self, @args) {
  die $self->usage unless getopt \@args, 'q|quiet' => \my $quiet;

  $self->quiet($quiet);

  unless ($self->app->test) {
    die 'Allowed only in test env';
  }

  my $mig = $self->app->mig;
  $self->_loud('Running migrations to 0');
  $mig->migrate(0);
  $self->_loud('Running migrations to head');
  $mig->migrate;
  $self->_loud('Done.');
}

1;

=head1 SYNOPSIS

  Usage: saram remigrate

=cut
