package Bloginya::Service::Blog;
use Mojo::Base -base, -signatures, -async_await;

has db    => undef;
has redis => undef;

async sub list_site_collections_p($self) {
  my $res = await $self->db->select_p(
    'collections',
    ['id', 'short', 'title'],
    {parent_id => undef},
    {order_by  => [{-asc => ['priority', 'created_at']}]}
  );

  return $res->hashes;
}

1;
