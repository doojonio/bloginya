package Bloginya::Service::Email::Backend::File;
use Mojo::Base 'Bloginya::Service::Email::Backend', -signatures;

use Email::MIME;
use File::Path qw(make_path);
use Time::Piece;

sub send_email ($self, $to, $subject, $html, $text) {
  my $smtp_config = $self->config->{smtp};
  my $output_dir = $smtp_config->{test_output_dir} || '/tmp/bloginya_emails';

  make_path($output_dir) unless -d $output_dir;

  my $email = Email::MIME->create(
    header_str => [
      From    => sprintf('%s <%s>', $smtp_config->{from_name}, $smtp_config->{from_email}),
      To      => $to,
      Subject => $subject,
    ],
    parts => [
      Email::MIME->create(
        attributes => {
          content_type => 'text/plain',
          charset      => 'UTF-8',
          encoding     => 'quoted-printable',
        },
        body_str => $text,
      ),
      Email::MIME->create(
        attributes => {
          content_type => 'text/html',
          charset      => 'UTF-8',
          encoding     => 'quoted-printable',
        },
        body_str => $html,
      ),
    ],
  );

  my $timestamp = Time::Piece->new->strftime('%Y%m%d_%H%M%S');
  my $safe_to = $to;
  $safe_to =~ s/[^a-zA-Z0-9@._-]/_/g;
  my $filename = sprintf('%s/%s_%s.eml', $output_dir, $timestamp, $safe_to);

  open my $fh, '>', $filename or die "Cannot write to $filename: $!";
  print $fh $email->as_string;
  close $fh;

  $self->log->info("Email written to file: $filename (to: $to, subject: $subject)");
}

1;
