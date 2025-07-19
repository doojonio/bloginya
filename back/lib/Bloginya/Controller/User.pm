package Bloginya::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub settings($self) {
  my $u = await $self->current_user_p;
  return $self->render(json => {username => $u->{username}});
}

async sub update_settings($self) {
  my $form = $self->i(json => 'UpdateUserSettingsPayload');

  await $self->service('settings')->update_settings_p($form);

  return $self->msg('OK');
}

async sub is_username_taken ($self) {
  my $username = $self->i(username => 'str[3,20]');
  my $taken    = await $self->service('user')->is_username_taken_p($username);
  return $self->render(json => $taken);
}

async sub get_profile ($self) {
  my $id      = $self->i(id => 'uuid');
  my $profile = await $self->service('user')->load_profile_p($id);
  return $self->render(json => $profile);
}


1
