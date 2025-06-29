package Bloginya::Service::Google;
use Mojo::Base -base, -signatures, -async_await;

has 'config';
has 'current_user';

has ua   => sub { Mojo::UserAgent->new };
has _cfg => sub { $_[0]->config->{google_oauth} };

async sub get_token_p($self, $code) {
  my $tx = await $self->ua->post_p(
    $self->_cfg->{token_uri} => json => {
      client_id     => $self->_cfg->{client_id},
      client_secret => $self->_cfg->{client_secret},
      code          => $code,
      grant_type    => 'authorization_code',
      redirect_uri  => $self->_cfg->{redirect_uri},
    }
  );

  die 'Failed to receive token' unless $tx->res->is_success;

  return $tx->res->json;
}

async sub get_userinfo_p($self, $token) {
  my $tx = await $self->ua->get_p(
    'https://www.googleapis.com/userinfo/v2/me' => {'Authorization' => 'Bearer ' . $token->{access_token}});

  die 'Failed to get user info' unless $tx->res->is_success;

  return $tx->res->json;
}

async sub detect_lang_p($self, $txt) {
  die 'not authorized' unless $self->current_user;

  my $tx = await $self->ua->post_p('https://translation.googleapis.com/language/translate/v2/detect' =>
      {Authorization => 'Bearer ' . $self->current_user->{google_token}{access_token}});

  warn 'Bearer ' . $self->current_user->{google_token}{access_token};
  die 'Failed to detect' unless $tx->res->is_success;

  return;
}

1;
