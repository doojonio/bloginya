package Bloginya::Controller::App;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub settings ($self) {

  my $db    = $self->db;
  my $redis = $self->redis;

  my %user;

  if (my $user = await $self->current_user_p) {
    $user{picture} = $user->{google_userinfo}{picture};
    $user{id}      = $user->{id};
    $user{role}    = $user->{role};
  }

  my $se_post = $self->service('post');

  # my $categories = await $se_post->list_site_categories_p();

  return $self->render(json => {user => %user ? \%user : undef});
}


1
