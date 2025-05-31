package Bloginya::Controller::Category;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Bloginya::Util::UUID qw(is_uuid);
use List::Util           qw(reduce);

async sub save($self) {
  my ($db, $redis) = ($self->db, $self->redis);
  my $user = await $self->current_user_p($db, $redis);

  my $p = $self->req->json;

  my %vals = (title => $$p{title}, user_id => $user->{id}, (parent_id => $$p{parent_id}) x !!$$p{parent_id});
  my ($id) = (await $self->db->insert_p('categories', \%vals, {returning => 'id'}))->array->@*;

  return $self->render(json => {id => $id});
}


async sub get($self) {
  my $id = $self->param('id');

  return $self->render(status => 400, json => {message => 'Invalid ID'}) unless is_uuid($id);

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
  my $parent_id = $self->param('pid');
  return $self->render(status => 400, json => {message => 'Invalid ID'}) if $parent_id && !is_uuid($parent_id);

  my %filter = (parent_id => $parent_id);

  my $db         = $self->db;
  my $categories = (await $db->select_p(
    'categories', ['id', 'title', 'picture', 'created_at'],
    \%filter, {order_by => {-desc => 'created_at'}},
  ))->hashes;

  my %resp = (categories => $categories);

  if ($parent_id) {
    my $res = (await $db->select_p('categories', ['title', 'picture', 'parent_id'], {id => $parent_id}))->hash;
    @resp{qw(parent_title parent_picture grandparent_id)} = @$res{qw(title picture parent_id)};
  }

  return $self->render(json => \%resp);
}

1
