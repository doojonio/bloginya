package Bloginya::Controller::App;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

async sub settings ($self) {

  my $db    = $self->db;
  my $redis = $self->redis;

  my %user;

  if (my $user = await $self->current_user_p) {
    $user{picture}  = $user->{google_userinfo}{picture};
    $user{id}       = $user->{id};
    $user{role}     = $user->{role};
    $user{username} = $user->{username};
  }

  my $se_cat = $self->service('category');

  # TODO: move tag to settins
  my $category_tag = 'langs';
  my $cats         = await $se_cat->list_site_categories_by_tag_p($category_tag);

  return $self->render(json => {user => %user ? \%user : undef, categories => $cats});
}


1
