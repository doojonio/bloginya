package Bloginya::Controller::Telemetry;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub ingest ($self) {
  my $data = $self->req->json;
  return $self->msg('BAD_REQUEST', 400) unless ref $data eq 'HASH';

  # Page load timing
  if (defined $data->{page_load_ms} && $data->{page_load_ms} =~ /^\d+(\.\d+)?$/) {
    my $seconds = $data->{page_load_ms} / 1000;
    $self->metrics->histogram_observe('bloginya_frontend_page_load_seconds', $seconds);
  }

  # Frontend errors
  if (ref $data->{errors} eq 'ARRAY') {
    for my $err (@{$data->{errors}}) {
      next unless ref $err eq 'HASH' && $err->{type};
      $self->metrics->inc('bloginya_frontend_errors_total', {type => $err->{type}});
    }
  }

  # Navigation event
  if (defined $data->{route}) {
    $self->metrics->inc('bloginya_frontend_navigation_total', {route => $data->{route}});
  }

  # Post read time
  if (defined $data->{post_read_seconds} && $data->{post_read_seconds} =~ /^\d+(\.\d+)?$/ && defined $data->{post_id}) {
    $self->metrics->histogram_observe('bloginya_post_read_seconds', $data->{post_read_seconds}, {post_id => $data->{post_id}});
  }

  return $self->msg('OK');
}

1;
