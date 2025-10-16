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

  my $mig  = $self->app->mig;
  my $prev = $mig->latest - 1;
  $self->_loud("Running migrations to $prev");
  $mig->migrate($prev);
  $self->_loud('Running migrations to head');
  $mig->migrate;
  $self->_loud('Done.');
}

1;

=head1 SYNOPSIS

  Usage: bloginya remigrate

=cut
