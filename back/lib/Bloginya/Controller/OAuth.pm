package Bloginya::Controller::OAuth;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Mojo::URL       ();
use Mojo::UserAgent ();

async sub to_google($self) {
  my $conf = $self->config->{google_oauth};

  my $url = Mojo::URL->new($conf->{auth_uri});

  my $called_from = $self->i('callback_uri' => 'str|undef') // '/';

  $url->query(
    client_id     => $conf->{client_id},
    redirect_uri  => $conf->{redirect_uri},
    response_type => 'code',
    scope         => 'email',
    state         => $called_from,
  );

  return $self->redirect_to($url);
}

async sub from_google($self) {
  my $code  = $self->i(code  => 'str');
  my $state = $self->i(state => 'str');

  my $google_service = $self->service('google');
  my $token          = await $google_service->get_token_p($code);
  my $userinfo       = await $google_service->get_userinfo_p($token);

  my $id = await $self->service('user')->find_or_create_by_google_id_p($userinfo, $token);
  await $self->create_session_p($id);

  return $self->redirect_to($state || '/');
}

1
