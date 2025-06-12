package Bloginya::Controller::Post;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Bloginya::Util::UUID qw(is_uuid);
use List::Util           qw(reduce);

async sub list_home ($self) {
  my $u = await $self->current_user_p;
  use DDP;
  p $u;
  my $s_post = $self->service('post');
  my $s_cat  = $self->service('category');

  my $new_posts = await $s_post->list_new_posts_p();

  my $cats = await $s_cat->list_site_priority_categories_p;
  my %top_cat;
  if (@$cats) {
    %top_cat = $cats->[0]->%*;
    $top_cat{posts} = (await $s_post->list_posts_by_category_p($top_cat{id}));
  }

  my $popular = await $s_post->list_popular_posts_p();

  return $self->render(
    json => {new_posts => $new_posts, cats => $cats, top_cat => \%top_cat, popular_posts => $popular});
}

async sub save($self) {
  my $db    = $self->db;
  my $redis = $self->redis;

  my $user = await $self->current_user_p;

  my $payload = $self->req->json;

  unless (defined($payload)) {
    my $id = await $self->service('post', user => $user)->create_draft_p();
    return $self->render(json => {id => $id});
  }


  my $id  = $payload->{id};
  my $doc = $payload->{doc};

  my ($title, $pic) = $self->_extract_title_n_pic($doc);

  my %vals = (title => $title, picture => $pic, document => {-json => $doc});
  if ($id) {
    return $self->render(status => 400, json => {message => 'Invalid id'}) unless is_uuid($id);

    $vals{modified_at} = \'now()';

    my $result = await $self->db->update_p('posts', \%vals, {id => $id, user_id => $user->{id}});
    unless ($result->rows) {
      return $self->render(status => 404, json => {message => 'No post with such id'});
    }

    return $self->render(json => {id => $id});
  }

  $vals{user_id} = $user->{id};
  ($id) = (await $self->db->insert_p('posts', \%vals, {returning => ['id']}))->array->@*;

  return $self->render(json => {id => $id});
}

sub _extract_title_n_pic($self, $doc) {
  my ($title, $picture) = ('', undef);

  my @elements = $doc->{doc}{content}->@*;

  while (my $el = shift @elements) {
    if (!$title && $el->{type} eq 'heading') {
      $title = reduce { $a . $b } map { $_->{text} } $el->{content}->@*;
    }
    if (!$picture && $el->{type} eq 'image') {
      $picture = $el->{attrs}{src};
    }

    last if $title && $picture;

    if (my $content = $el->{content}) {
      unshift @elements, $content->@*;
    }
  }

  return $title, $picture;
}

async sub get($self) {
  my $id = $self->param('id');

  return $self->render(status => 400, json => {message => 'Invalid ID'}) unless is_uuid($id);

  # NOTE: expand is not that neeeded acatually
  my $post = (await $self->db->select_p('posts', '*', {id => $id}))->expand->hash;

  return $self->render(status => 404, json => {message => 'Blog not found'}) unless $post;
  return $self->render(json   => $post);
}

async sub list($self) {
  my $is_drafts = !!$self->param('drafts');
  my $limit     = ($self->param('limit') // 50) + 0;
  my $page      = ($self->param('page')  // 0) + 0;

  $limit = 50 if $limit > 100;

  if ($is_drafts) {
    my $posts = (await $self->db->select_p(
      'posts',
      ['id', 'title', 'picture', 'created_at'],
      {status   => 'draft'},
      {order_by => {-desc => 'created_at'}, limit => $limit, offset => $limit * $page}
    ))->hashes;

    return $self->render(json => $posts);
  }

  return $self->render(json => []);
}

async sub publish($self) {
  my $payload = $self->req->json;

  my $post_id = $payload->{post_id};
  return $self->render(status => 400, json => {message => 'Missing post_id'}) if !is_uuid($post_id);

  my $category_id = $payload->{category_id};
  return $self->render(status => 400, json => {message => 'Invalid category_id'}) if $category_id && !is_uuid($post_id);

  my $res
    = (await $self->db->update_p('posts', {status => 'pub', category_id => $category_id}, {id => $post_id},))->rows;

  return $self->render(status => 404, json => {message => 'Blog not found'}) unless $res;
  return $self->render(json => {id => $post_id});
}

1
