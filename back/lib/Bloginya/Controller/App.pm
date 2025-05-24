package Bloginya::Controller::App;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub common_data ($self) {

  my $db    = $self->db;
  my $redis = $self->redis;

  my $user = await $self->current_user_p($db, $redis);

  return $self->render(
    json => {user => {picture => $user->{google_userinfo}{picture},}, collections => [{name => 'Japan'}]});
}


1
