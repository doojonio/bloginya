package Bloginya::Service::Email::Backend;
use Mojo::Base -base, -signatures;

use Carp qw(croak);

has 'config';
has 'log';

sub send_email ($self, $to, $subject, $html, $text) {
  croak 'send_email must be implemented by subclass';
}

1;
