package Bloginya::Service::Settings;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'current_user';

async sub update_settings_p($self, $form) {
  my $u = $self->current_user;
  die 'no rights' unless $u;

  await $self->db->update_p('users', {username => $form->{username}}, {id => $u->{id}});
}


1;
