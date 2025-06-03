package Bloginya::Service::Category;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'redis';

async sub list_site_priority_categories_p($self) {
  my $res = await $self->db->select_p(
    ['categories',    ['shortnames', 'categories.id' => 'shortnames.category_id']],
    ['categories.id', 'categories.title', 'shortnames.name'], {parent_id => undef},
    {order_by => [\'priority asc nulls last', {-asc => 'created_at'}]}

  );

  return $res->hashes;
}

