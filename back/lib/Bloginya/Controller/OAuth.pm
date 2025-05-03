package Bloginya::Controller::OAuth;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Mojo::URL       ();
use Mojo::UserAgent ();

async sub to_google($self) {
  my $conf = $self->config->{google_oauth};

  my $url = Mojo::URL->new('https://accounts.google.com/o/oauth2/v2/auth');

  $url->query(
    client_id     => $conf->{client_id},
    redirect_uri  => 'http://localhost:4200/api/oauth/from_google',
    response_type => 'code',
    scope         => 'email',
  );

  return $self->redirect_to($url);
}

async sub from_google($self) {

  my $code = $self->param('code');

  return $self->render(status => 400, message => 'missing code') unless $code;

  my $ua     = Mojo::UserAgent->new;
  my $config = $self->config->{google_oauth};

  my $tx = await $ua->post_p(
    'https://oauth2.googleapis.com/token' => json => {
      client_id     => $config->{client_id},
      client_secret => $config->{client_secret},
      code          => $code,
      grant_type    => 'authorization_code',
      redirect_uri  => 'http://localhost:4200/api/oauth/from_google',
    }
  );

  my $site = $self->config->{site};

  # TODO: come up with error
  unless ($tx->res->is_success) {
    return $self->redirect_to($site . '/login');
  }

  my $token = $tx->res->json;
  $tx = await $ua->get_p(
    'https://www.googleapis.com/userinfo/v2/me' => {'Authorization' => 'Bearer ' . $token->{access_token}});
  unless ($tx->res->is_success) {
    return $self->redirect_to($site . '/login');
  }

  my $userinfo = $tx->res->json;

  my $db   = $self->db;
  my $user = (await $db->select_p('users', 'id', {google_id => $userinfo->{id}}))->hash;

  unless ($user) {
    my %user = (
      email           => $userinfo->{email},
      username        => (split(/@/, $userinfo->{email}))[0],
      google_id       => $userinfo->{id},
      google_token    => {-json => $token},
      google_userinfo => {-json => $userinfo},
    );

    $user = (await $db->insert_p('users', \%user, {returning => 'id'}))->hash;
  }

  my $session_id = (await $db->insert_p(
    'users_sessions',
    {user_id   => $user->{id}, ip => $self->real_ip, app => $self->client_app},
    {returning => 'id'},
  ))->hash->{id};

  $self->set_sid($session_id);

  return $self->redirect_to($site);
}

1
