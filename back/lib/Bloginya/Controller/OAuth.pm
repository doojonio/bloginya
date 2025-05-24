package Bloginya::Controller::OAuth;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Mojo::URL       ();
use Mojo::UserAgent ();

async sub to_google($self) {
  my $site_name = $self->config->{site_name};
  my $conf      = $self->config->{google_oauth};

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
  warn "BBB";
  return $self->render(status => 400, json => {message => $v->{error}}) if $v->has_error;

  warn "AAA";

  my $ua     = Mojo::UserAgent->new;
  my $config = $self->config->{google_oauth};

  my $tx = await $ua->post_p(
    $config->{token_uri} => json => {
      client_id     => $config->{client_id},
      client_secret => $config->{client_secret},
      code          => $code,
      grant_type    => 'authorization_code',
      redirect_uri  => $config->{redirect_uri},
    }
  );

  my $site = $self->config->{site_name};

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

  await $self->create_session_p($user->{id}, $db, $self->redis);

  return $self->redirect_to($site);
}

1
