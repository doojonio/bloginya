package Bloginya::Service::Google;
use Mojo::Base -base, -signatures, -async_await;

has 'config';

async sub get_token_p($self, $code) {
  my $ua = Mojo::UserAgent->new;

  my $tx = await $ua->post_p(
    $self->config->{token_uri} => json => {
      client_id     => $self->config->{client_id},
      client_secret => $self->config->{client_secret},
      code          => $code,
      grant_type    => 'authorization_code',
      redirect_uri  => $self->config->{redirect_uri},
    }
  );

  die 'Failed to receive token' unless $tx->res->is_success;

  return $tx->res->json;
}

async sub get_userinfo_p($self, $token) {
  my $ua = Mojo::UserAgent->new;

  my $tx = await $ua->get_p(
    'https://www.googleapis.com/userinfo/v2/me' => {'Authorization' => 'Bearer ' . $token->{access_token}});

  die 'Failed to get user info' unless $tx->res->is_success;

  return $tx->res->json;
}

1;
