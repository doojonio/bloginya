package Bloginya::Controller::CleanUp;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub estimate($self) {
  my $user = await $self->current_user_p;
  return $self->render(status => 404) if (!$user || $user->{role} ne 'owner');
  my $clean_up_service = $self->service('clean_up');
  my %estimated = $clean_up_service->estimate();
  return $self->render(json => \%estimated);
}


async sub cleanup($self) {
  my $user = await $self->current_user_p;
  return $self->render(status => 404) if (!$user || $user->{role} ne 'owner');

  my $clean_up_service = $self->service('clean_up');
  my %cleaned = $clean_up_service->cleanup();
  return $self->render(json => \%cleaned);
}


1
