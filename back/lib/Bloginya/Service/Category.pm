package Bloginya::Service::Category;
use Mojo::Base -base, -signatures, -async_await;

use List::Util qw(any);

has 'db';
has 'redis';
has 'current_user';

async sub create_p ($self, $vals) {
  my %fields = map { $_ => $vals->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw (title parent_id description priority)
  } keys %$vals;

  $fields{user_id} = $self->current_user->{id};

  my $id = (await $self->db->insert_p('categories', \%fields, {returning => ['id']}))->hashes->first->{id};
  return $id;
}

async sub get_by_title_p($self, $title) {
  (await $self->db->select_p('categories', [qw(title id priority description)], {title => $title}))->hashes->first;
}

async sub list_all_categories_p($self) {
  return (await $self->db->select_p('categories', [qw(id title)]))->hashes;
}

async sub list_site_priority_categories_p($self) {
  my $res = await $self->db->select_p(
    ['categories',    ['shortnames', 'categories.id' => 'shortnames.category_id']],
    ['categories.id', 'categories.title', 'shortnames.name'], {parent_id => undef},
    {order_by => [\'priority asc nulls last', {-asc => 'created_at'}]}

  );

  return $res->hashes;
}


1;
