package Bloginya::Controller::Subscription;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub subscribe ($self) {
  try {
    await $self->service('subscription')->subscribe_p();
    return $self->msg('OK');
  }
  catch ($e) {
    $self->log->error("Subscribe error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub unsubscribe ($self) {
  try {
    await $self->service('subscription')->unsubscribe_p();
    return $self->msg('OK');
  }
  catch ($e) {
    $self->log->error("Unsubscribe error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub unsubscribe_by_secret ($self) {
  my $secret = $self->param('secret');

  unless ($secret) {
    return $self->msg('INVALID', 400);
  }

  try {
    await $self->service('subscription')->unsubscribe_by_secret_p($secret);
    return $self->render(
      text => 'You have been successfully unsubscribed from email notifications.',
      status => 200
    );
  }
  catch ($e) {
    if ($e =~ /invalid secret/) {
      return $self->msg('INVALID', 404);
    }
    $self->log->error("Unsubscribe by secret error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub status ($self) {
  try {
    my $status = await $self->service('subscription')->get_status_p();
    return $self->render(json => $status);
  }
  catch ($e) {
    $self->log->error("Get status error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub admin_enable ($self) {
  my $user_id = $self->i(user_id => 'uuid');

  try {
    await $self->service('subscription')->admin_enable_p($user_id);
    return $self->msg('OK');
  }
  catch ($e) {
    if ($e =~ /not authorized/) {
      return $self->msg('NORIGHT', 403);
    }
    $self->log->error("Admin enable error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub admin_disable ($self) {
  my $user_id = $self->i(user_id => 'uuid');

  try {
    await $self->service('subscription')->admin_disable_p($user_id);
    return $self->msg('OK');
  }
  catch ($e) {
    if ($e =~ /not authorized/) {
      return $self->msg('NORIGHT', 403);
    }
    $self->log->error("Admin disable error: $e");
    return $self->msg('ERROR', 500);
  }
}

async sub admin_list ($self) {
  my $subscribed = $self->param('subscribed');

  my %filters;
  if (defined $subscribed) {
    $filters{subscribed} = $subscribed eq 'true' || $subscribed eq '1' ? 1 : 0;
  }

  try {
    my $list = await $self->service('subscription')->admin_list_p(\%filters);
    return $self->render(json => $list);
  }
  catch ($e) {
    if ($e =~ /not authorized/) {
      return $self->msg('NORIGHT', 403);
    }
    $self->log->error("Admin list error: $e");
    return $self->msg('ERROR', 500);
  }
}

1;
