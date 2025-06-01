package Bloginya::Service::Post;
use Mojo::Base -base, -signatures, -async_await;

has 'db';
has 'redis';

async sub list_site_categories_p($self) {
  my $res = await $self->db->select_p(
    'categories',
    ['id', 'short', 'title'],
    {parent_id => undef},
    {order_by  => [{-asc => ['priority', 'created_at']}]}
  );

  return $res->hashes;
}

1;
