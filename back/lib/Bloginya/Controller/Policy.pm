package Bloginya::Controller::Policy;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub can_upload_audio($self) {
  my $user = await $self->current_user_p;
  my $result = $self->service('policy')->can_upload_audio();

  $self->render(json => $result);
}

async sub can_backup($self) {
  my $user       = await $self->current_user_p;
  my $authorized = $self->service('policy')->can_backup();

  $self->render(json => {authorized => $authorized ? 1 : 0});
}


1;
