package Bloginya::Controller::Post;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

use Bloginya::Util::CoolId qw(is_cool_id);
use List::Util             qw(reduce);

async sub list_home ($self) {
  my $u      = await $self->current_user_p;
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

async sub create_draft($self) {
  my $id = await $self->service('post')->create_draft_p();
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

  return $self->render(status => 404, json => {message => 'Blog not found'}) unless $post;
  return $self->render(json   => $post);
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
      $ok = undef;
    }
    else {
      die $e;
    }
  }

  return $self->msg('OK');
}

1
