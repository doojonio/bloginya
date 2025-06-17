package Bloginya::Controller::Category;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use List::Util qw(reduce);

async sub save($self) {
  my ($db, $redis) = ($self->db, $self->redis);

  my $cat = $self->i(json => 'CategorySavePayload');

  my $id = await $self->service('category')->create_p($cat);

  return $self->render(json => {id => $id, title => $cat->{title}});
}


async sub get($self) {
  my $id = $self->i(id => 'cool_id');

  my $db = $self->db;

  my $categories
    = (await $db->select_p('categories', [qw(id title picture)], {-or => {id => $id, parent_id => $id}}))->hashes;

  # TODO optimize wo double cycle
  my ($category) = grep { $_->{id} eq $id } @$categories;
  return $self->render(status => 404, json => {message => 'category not found'}) unless $category;

  my @subc  = grep { $_->{id} ne $id } @$categories;
  my $posts = (await $db->select_p('posts', [qw(id title picture)], {category_id => $id}))->hashes;

  $category->{categories} = \@subc;
  $category->{posts}      = $posts;

  return $self->render(json => $category);
}

async sub list($self) {
  my $cats = await $self->service('category')->list_all_categories_p();
  return $self->render(json => $cats);
}

1
