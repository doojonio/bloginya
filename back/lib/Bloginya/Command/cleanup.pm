package Bloginya::Command::cleanup;
use Mojo::Base 'Mojolicious::Command', -signatures;

use DateTime;
use DateTime::Duration;
use Mojo::Util qw(getopt);

has description => 'Clean up sessions and unused uploads';
has usage       => sub ($self) { $self->extract_usage };

sub run ($self, @args) {
  die $self->usage unless getopt \@args, 'q|quiet' => \my $quiet;
  $self->quiet($quiet);

  my $clean_up_service = $self->app->service('clean_up');
  my @res              = $clean_up_service->cleanup();

  $self->_loud(join ' ', @res);
}


1;

=head1 SYNOPSIS

  Usage: bloginya cleanup

=cut
