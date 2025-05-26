package Bloginya::Controller::Collection;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Bloginya::Util::UUID qw(is_uuid);
use List::Util           qw(reduce);

async sub save($self) {
  my ($db, $redis) = ($self->db, $self->redis);
  my $user = await $self->current_user_p($db, $redis);

  my $p = $self->req->json;

  my %vals = (title => $$p{title}, user_id => $user->{id}, (parent_id => $$p{parent_id}) x !!$$p{parent_id});
  my ($id) = (await $self->db->insert_p('collections', \%vals, {returning => 'id'}))->array->@*;

  return $self->render(json => {id => $id});
}


async sub get($self) {
  my $id = $self->param('id');

  return $self->render(status => 400, json => {message => 'Invalid ID'}) unless is_uuid($id);

  my $db = $self->db;

  my $collections
    = (await $db->select_p('collections', [qw(id title img_src)], {-or => {id => $id, parent_id => $id}}))->hashes;

  # TODO optimize wo double cycle
  my ($collec) = grep { $_->{id} eq $id } @$collections;
  return $self->render(status => 404, json => {message => 'Collection not found'}) unless $collec;

  my @subc  = grep { $_->{id} ne $id } @$collections;
  my $blogs = (await $db->select_p('blogs', [qw(id title img_src)], {collection_id => $id}))->hashes;

  $collec->{collections} = \@subc;
  $collec->{blogs}       = $blogs;

  return $self->render(json => $collec);
}

async sub list($self) {
  my $parent_id = $self->param('pid');
  return $self->render(status => 400, json => {message => 'Invalid ID'}) if $parent_id && !is_uuid($parent_id);

  my %filter = (parent_id => $parent_id);

  my $db          = $self->db;
  my $collections = (await $db->select_p(
    'collections', ['id', 'title', 'img_src', 'created_at'],
    \%filter, {order_by => {-desc => 'created_at'}},
  ))->hashes;

  my %resp = (collections => $collections);

  if ($parent_id) {
    my $res = (await $db->select_p('collections', ['title', 'img_src', 'parent_id'], {id => $parent_id}))->hash;
    @resp{qw(parent_title parent_img_src grandparent_id)} = @$res{qw(title img_src parent_id)};
  }

  return $self->render(json => \%resp);
}

1
