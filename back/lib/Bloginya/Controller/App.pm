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

  my $s_blog = $self->service('blog', db => $db, redis => $redis);

  my $colls = await $s_blog->list_site_collections_p();

  return $self->render(json => {user => %user ? \%user : undef, collections => $colls});
}


1
