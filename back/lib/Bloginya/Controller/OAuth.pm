package Bloginya::Controller::OAuth;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Mojo::URL       ();
use Mojo::UserAgent ();

async sub to_google($self) {
  my $conf = $self->config->{google_oauth};

  my $url = Mojo::URL->new($conf->{auth_uri});

  $url->query(
    client_id     => $conf->{client_id},
    redirect_uri  => $conf->{redirect_uri},
    response_type => 'code',
    scope         => 'email',
  );

  return $self->redirect_to($url);
}

async sub from_google($self) {
  my $v    = $self->validation;
  my $code = $v->required('code')->param;
  return $self->render(status => 400, json => {message => $v->{error}}) if $v->has_error;

  my $google_service = $self->app->service('google');
  my $token          = await $google_service->get_token_p($code);
  my $userinfo       = await $google_service->get_userinfo_p($token);

  my $user = await $self->service('user')->find_or_create_by_google_id_p($userinfo, $token);
  await $self->create_session_p($user->{id});

  return $self->redirect_to('/');
}

1
