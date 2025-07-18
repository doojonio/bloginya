package Bloginya::Service::Shortname;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use List::Util qw(any);


has 'db';
has 'redis';
has 'user';
has 'log';

async sub set_shortname_for_post($self, $post_id, $name) {
  $self->log->debug(qq/Setting shortname for post $post_id: / . ($name ? qq/"$name"/ : 'none'));
  await $self->db->delete_p('shortnames', {post_id => $post_id});
  return unless length $name;

  if (my $sn = await $self->find_p($name)) {
    return if ($sn->{post_id} // '') eq $post_id;
    $self->log->warn(qq/Attempted to set taken shortname "$name" for post $post_id/);
    die 'Shortname taken';
  }
  await $self->db->insert_p('shortnames', {post_id => $post_id, name => $name});
  $self->log->info(qq/Set shortname "$name" for post $post_id/);
}

async sub set_shortname_for_category($self, $category_id, $name) {
  $self->log->debug(qq/Setting shortname for category $category_id: / . ($name ? qq/"$name"/ : 'none'));
  await $self->db->delete_p('shortnames', {category_id => $category_id});
  return unless length $name;

  if (my $sn = await $self->find_p($name)) {
    return if ($sn->{category_id} // '') eq $category_id;
    $self->log->warn(qq/Attempted to set taken shortname "$name" for category $category_id/);
    die 'Shortname taken';
  }
  await $self->db->insert_p('shortnames', {category_id => $category_id, name => $name});
  $self->log->info(qq/Set shortname "$name" for category $category_id/);
}

async sub find_p($self, $name) {
  $self->log->trace(qq/Finding shortname "$name"/);
  my $sn = (await $self->db->select_p('shortnames', [qw(name post_id category_id)], {name => $name}))->hashes->first;
  if ($sn) {
    $self->log->trace(qq/Found shortname "$name"/);
  }

  return $sn;
}


1
