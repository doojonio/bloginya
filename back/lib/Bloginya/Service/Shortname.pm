package Bloginya::Service::Shortname;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use List::Util qw(any);


has 'db';
has 'redis';
has 'user';

async sub set_shortname_for_post($self, $post_id, $name) {
  if (my $sn = await $self->find_p($name)) {
    return if ($sn->{post_id} // '') eq $post_id;
    die 'Shortname taken';
  }
  await $self->db->delete_p('shortnames', {post_id => $post_id});
  await $self->db->insert_p('shortnames', {post_id => $post_id, name => $name});
}

async sub set_shortname_for_category($self, $category_id, $name) {
  if (my $sn = await $self->find_p($name)) {
    return if ($sn->{category_id} // '') eq $category_id;
    die 'Shortname taken';
  }
  await $self->db->delete_p('shortnames', {category_id => $category_id});
  await $self->db->insert_p('shortnames', {category_id => $category_id, name => $name});
}

async sub find_p($self, $name) {
  (await $self->db->select_p('shortnames', [qw(name post_id category_id)], {name => $name}))->hashes->first;
}


1
