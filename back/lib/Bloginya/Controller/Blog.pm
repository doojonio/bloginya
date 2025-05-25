package Bloginya::Controller::Blog;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Bloginya::Util::UUID qw(is_uuid);
use List::Util           qw(reduce);

async sub save($self) {
  my $db    = $self->db;
  my $redis = $self->redis;

  my $user = await $self->current_user_p($db, $redis);

  return $self->render(status => 401, json => {message => 'not authorized'}) unless $user;

  my $payload = $self->req->json;

  my $id  = $payload->{id};
  my $doc = $payload->{doc};

  my ($title, $img) = $self->_extract_title_n_img($doc);

  my %vals = (title => $title, img_src => $img, document => {-json => $doc});
  if ($id) {
    return $self->render(status => 400, json => {message => 'Invalid id'}) unless is_uuid($id);

    $vals{modified_at} = \'now()';

    my $result = await $self->db->update_p('blogs', \%vals, {id => $id, user_id => $user->{id}});
    unless ($result->rows) {
      return $self->render(status => 404, json => {message => 'No blog with such id'});
    }

    return $self->render(json => {id => $id});
  }

  $vals{user_id} = $user->{id};
  ($id) = (await $self->db->insert_p('blogs', \%vals, {returning => ['id']}))->array->@*;

  return $self->render(json => {id => $id});
}

sub _extract_title_n_img($self, $doc) {
  my ($title, $img_src) = ('', undef);

  my @elements = $doc->{doc}{content}->@*;

  while (my $el = shift @elements) {
    if (!$title && $el->{type} eq 'heading') {
      $title = reduce { $a . $b } map { $_->{text} } $el->{content}->@*;
    }
    if (!$img_src && $el->{type} eq 'image') {
      $img_src = $el->{attrs}{src};
    }

    last if $title && $img_src;

    if (my $content = $el->{content}) {
      unshift @elements, $content->@*;
    }
  }

  return $title, $img_src;
}

async sub get($self) {
  my $id = $self->param('id');

  return $self->render(status => 400, json => {message => 'Invalid ID'}) unless is_uuid($id);

  # NOTE: expand is not that neeeded acatually
  my $blog = (await $self->db->select_p('blogs', '*', {id => $id}))->expand->hash;

  return $self->render(status => 404, json => {message => 'Blog not found'}) unless $blog;
  return $self->render(json   => $blog);
}

async sub list($self) {
  my $is_drafts = !!$self->param('drafts');
  my $limit     = ($self->param('limit') // 50) + 0;
  my $page      = ($self->param('page')  // 0) + 0;

  $limit = 50 if $limit > 100;

  if ($is_drafts) {
    my $blogs = (await $self->db->select_p(
      'blogs',
      ['id', 'title', 'img_src', 'created_at'],
      {status   => 'draft'},
      {order_by => {-desc => 'created_at'}, limit => $limit, offset => $limit * $page}
    ))->hashes;

    return $self->render(json => $blogs);
  }

  return $self->render(json => []);
}

async sub publish($self) {
  my $payload = $self->req->json;

  my $blog_id = $payload->{blog_id};
  return $self->render(status => 400, json => {message => 'Missing blog_id'}) if !is_uuid($blog_id);

  my $collection_id = $payload->{collection_id};
  return $self->render(status => 400, json => {message => 'Invalid collection_id'})
    if $collection_id && !is_uuid($blog_id);

  my $res
    = (await $self->db->update_p('blogs', {status => 'pub', collection_id => $collection_id}, {id => $blog_id},))->rows;

  return $self->render(status => 404, json => {message => 'Blog not found'}) unless $res;
  return $self->render(json => {id => $blog_id});
}

1
