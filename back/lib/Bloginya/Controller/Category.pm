package Bloginya::Controller::Category;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

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


async sub list($self) {
  my $cats = await $self->service('category')->list_all_categories_p();
  return $self->render(json => $cats);
}

1
