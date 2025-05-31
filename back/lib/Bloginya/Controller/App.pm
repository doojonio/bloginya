package Bloginya::Controller::App;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub common_data ($self) {

  my $db    = $self->db;
  my $redis = $self->redis;

  my %user;

  my $user = await $self->current_user_p($db, $redis);
  if ($user) {
    $user{picture} = $user->{google_userinfo}{picture};
  }

  my $s_post = $self->service('post', db => $db, redis => $redis);

  my $colls = await $s_post->list_site_categories_p();

  return $self->render(json => {user => %user ? \%user : undef, categories => $colls});
}


1
