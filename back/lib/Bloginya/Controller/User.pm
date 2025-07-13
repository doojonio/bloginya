package Bloginya::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub block($self) {
  my $id = $self->i(id => 'uuid');
  try {
    await $self->service('block')->block_p($id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      return $self->msg('NORIGHT', 403);
    }
    else {
      die $e;
    }
  }
  return $self->msg('OK');
}

async sub settings($self) {
  my $u = await $self->current_user_p;
  return $self->render(json => {username => $u->{username}});
}

async sub update_settings($self) {
  my $form = $self->i(json => 'UpdateUserSettingsPayload');

  await $self->service('settings')->update_settings_p($form);

  return $self->msg('OK');
}


1
