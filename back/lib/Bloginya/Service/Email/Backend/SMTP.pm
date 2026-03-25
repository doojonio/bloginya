package Bloginya::Service::Email::Backend::SMTP;
use Mojo::Base 'Bloginya::Service::Email::Backend', -signatures;

use Email::Sender::Simple qw(sendmail);
use Email::Sender::Transport::SMTP ();
use Email::MIME;

has 'transport' => sub ($self) {
  my $smtp_config = $self->config->{smtp};

  Email::Sender::Transport::SMTP->new({
    host => $smtp_config->{host},
    port => $smtp_config->{port},
    ssl  => $smtp_config->{ssl},
    sasl_username => $smtp_config->{username},
    sasl_password => $smtp_config->{password},
  });
};

sub send_email ($self, $to, $subject, $html, $text) {
  my $smtp_config = $self->config->{smtp};

  my $email = Email::MIME->create(
    header_str => [
      From    => sprintf('%s <%s>', $smtp_config->{from_name}, $smtp_config->{from_email}),
      To      => $to,
      Subject => $subject,
    ],
    parts => [
      Email::MIME->create(
        attributes => {
          content_type => 'text/html',
          charset      => 'UTF-8',
          encoding     => 'quoted-printable',
        },
        body_str => $html,
      ),
      Email::MIME->create(
        attributes => {
          content_type => 'text/plain',
          charset      => 'UTF-8',
          encoding     => 'quoted-printable',
        },
        body_str => $text,
      ),
    ],
  );

  eval {
    sendmail($email, { transport => $self->transport });
    $self->log->info("Email sent to $to: $subject");
    1;
  } or do {
    my $err = $@ || 'Unknown error';
    $self->log->error("Failed to send email to $to: $err");
    die $err;
  };
}

1;
