package Bloginya::Controller::Post;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub drafts ($self) {
  my $drafts = await $self->service('post')->get_drafts_p();
  return $self->render(json => $drafts);

}

async sub list_home ($self) {
  my $u       = await $self->current_user_p;
  my $se_post = $self->service('post');
  my $se_cat  = $self->service('category');

  my $new_posts = await $se_post->list_new_posts_p();

  my $cats = await $se_cat->list_site_priority_categories_p;
  my %top_cat;
  if (@$cats) {
    %top_cat = $cats->[0]->%*;
    $top_cat{posts} = (await $se_post->list_posts_by_category_p($top_cat{id}));
  }

  my $popular = await $se_post->list_popular_posts_p();

  return $self->render(
    json => {new_posts => $new_posts, cats => $cats, top_cat => \%top_cat, popular_posts => $popular});
}

async sub list_by_category($self) {
  my $id = $self->i(id => 'cool_id');

  return $self->render(json => (await $self->service('post')->list_posts_by_category_p($id)));
}

async sub create_draft($self) {
  my $id = await $self->service('post')->create_draft_p();
  return $self->render(json => {id => $id});
}

async sub like($self) {
  my $id = $self->i(id => 'cool_id');
  await $self->service('post')->like_post_p($id);
  return $self->msg('OK');
}

async sub unlike($self) {
  my $id = $self->i(id => 'cool_id');
  await $self->service('post')->unlike_post_p($id);
  return $self->msg('OK');
}

async sub get($self) {
  my ($id) = $self->i(id => 'cool_id');

  my $post;
  try {
    $post = await $self->service('post')->read_p($id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      $post = undef;
    }
    else {
      die $e;
    }
  }

  return $self->msg('Not Found', 404) unless $post;
  return $self->render(json => $post);
}

async sub search_similliar_posts($self) {
  my $post_id = $self->i('id' => 'cool_id');

  my $posts;
  try {
    $posts = await $self->service('post')->search_similliar_posts_p($post_id);
  }
  catch ($e) {
    if ($e =~ /not found/) {
      return $self->msg('Post Not Found', 404);
    }
    else {
      die $e;
    }
  }

  return $self->render(json => $posts);
}

async sub get_for_edit($self) {
  my ($id) = $self->i(id => 'cool_id');

  my $post;
  try {
    $post = await $self->service('post')->get_for_edit_p($id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      $post = undef;
    }
    else {
      die $e;
    }
  }

  return $self->render(status => 404, json => {message => 'Post not found'}) unless $post;
  return $self->render(json   => $post);
}

async sub update_draft ($self) {
  my ($id, $payload) = $self->i(id => 'cool_id', json => 'UpdateDraftPayload');

  my $ok;
  try {
    $ok = await $self->service('post')->update_draft_p($id, $payload);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      $ok = undef;
    }
    else {
      die $e;
    }
  }

  return $self->msg('OK');
}

async sub apply_changes ($self) {
  my ($id, $payload) = $self->i(id => 'cool_id', json => 'ApplyChangesPayload');

  # TODO ok stuff
  my $ok;
  try {
    $ok = await $self->service('post')->apply_changes_p($id, $payload);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      return $self->msg('NORIGHT', 403);
    }
    elsif ($e =~ /missing category/) {
      return $self->msg('NOCAT', 400);
    }
    else {
      die $e;
    }
  }

  return $self->msg('OK');
}


1
