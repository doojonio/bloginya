package Bloginya::Plugin::Log4perl;

use Mojo::Base 'Mojolicious::Plugin';
use Log::Log4perl;
use Carp 'croak';


# Plugin registration
sub register {
  my ($self, $app, $conf) = @_;

  my $config_file = $conf->{config_file} // $app->config->{log4perl}{config_file};
  croak 'Log4perl config_file not specified in plugin config' unless $config_file;
  croak "Log4perl config_file '$config_file' not found"       unless -f $config_file;

  # Initialize Log4perl and watch for configuration changes.
  Log::Log4perl->init_and_watch($config_file, $conf->{watch_delay} || 60);

  # This helper provides a Log4perl logger scoped to the calling package.
  $app->helper(
    log => sub {
      my $pkg = (caller(1))[0];    # Get package of the helper's caller
      return Log::Log4perl->get_logger($pkg);
    }
  );


  # Redirect core Perl warnings (warn()) to Log4perl.
  # This is a global change that captures warnings from any package.
  $SIG{__WARN__} = sub {

    # Use caller(1) to find the package that triggered the warning.
    # This allows Log4perl to use the correct category (e.g., Bloginya.Plugin.CoolIO).
    my $pkg    = (caller(1))[0] // 'main';
    my $logger = Log::Log4perl->get_logger($pkg);

    my $message = shift;
    chomp $message;    # warn() adds a newline that we don't need
    $logger->warn($message);
  };


  # Replace the default Mojolicious logger to route its messages through Log4perl.
  $app->log(Log::Log4perl->get_logger('Mojolicious'));
}


1;
