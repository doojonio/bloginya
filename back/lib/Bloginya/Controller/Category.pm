package Bloginya::Controller::Category;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';

async sub update($self) {
  my ($id, $cat) = $self->i(id => 'cool_id', json => 'CategorySavePayload');

  my $id = await $self->service('category')->update_p($id, $cat);

  return $self->render(json => {id => $id, title => $cat->{title}});
}
async sub save($self) {
  my $cat = $self->i(json => 'CategorySavePayload');

  my $id = await $self->service('category')->create_p($cat);

  return $self->render(json => {id => $id, title => $cat->{title}});
}

async sub get_by_title($self) {
  my $title = $self->i(title => 'str[1,140]');

  my $cat = await $self->service('category')->get_by_title_p($title);

  if (!$cat) {
    $self->msg('Not Found', 404);
  }
  else {
    $self->render(json => $cat);
  }
}

async sub get_for_edit ($self) {
  my $id  = $self->i('id' => 'cool_id');
  my $cat = await $self->service('category')->get_for_edit_p($id);
  return $self->render(json => $cat);
}


async sub list($self) {
  my $cats = await $self->service('category')->list_all_categories_p();
  return $self->render(json => $cats);
}

async sub load_category($self) {
  my ($id, $page, $sort) = $self->i(id => 'cool_id', page => 'num|undef', 'sort' => 'cat_sort|undef');
  $page //= 0;

  my $cat;

  try {
    $cat = await $self->service('category')->load_p($id, $page, $sort);
  }
  catch ($e) {
    if ($e =~ /not found/) {
      return $self->msg('not found', 404);
    }
    else {
      die $e;
    }
  }

  return $self->render(json => $cat);
}

1
