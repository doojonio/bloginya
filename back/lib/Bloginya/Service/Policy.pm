package Bloginya::Service::Policy;
use Mojo::Base -base, -signatures, -async_await;

use List::Util qw(any none);

use Bloginya::Model::Post qw(POST_STATUS_PUB POST_STATUS_DEL POST_STATUS_DRAFT);
use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);

has 'db';
has 'current_user';

sub can_read_post($self, $post) {
  return 1 if $post->{status} eq POST_STATUS_PUB;

  my $user = $self->current_user;
  return 1 if $post->{user_id} eq $user->{id};
  return 1 if $user->{role} eq USER_ROLE_OWNER;
  return 0;
}

async sub can_read_post_p($self, $post_id) {
  my $user = $self->current_user;
  return 1 if $user && $user->{role} eq USER_ROLE_OWNER;
  return $self->can_read_post(
    (await $self->db->select_p('posts', ['user_id', 'status'], {id => $post_id}))->hashes->first // die 'not found');
}

sub can_update_post($self, $post) {
  my $user = $self->current_user;
  return 0 unless $user;
  return 1 if $user->{id} eq $post->{user_id} || $user->{role} eq USER_ROLE_OWNER;
  return 0;
}

async sub can_update_post_p($self, $post_id) {
  return 0 unless $self->current_user;
  return 1 if $self->current_user->{role} eq USER_ROLE_OWNER;
  $self->can_update_post((await $self->db->select_p('posts', 'user_id', {id => $post_id}))->hashes->first
      // die 'not found');
}

sub can_create_post($self) {
  my $user = $self->current_user;
  return 0 unless $user;
  return 0 if none { $_ eq $user->{role} } USER_ROLE_CREATOR, USER_ROLE_OWNER;
  return 1;
}

sub can_change_categories($self) {
  my $user = $self->current_user;
  return 0 unless $user;
  return 1 if $user->{role} eq USER_ROLE_OWNER;
  return 0;
}


sub can_upload_audio ($self) {
  my $user = $self->current_user;
  return $user && ($user->{role} eq USER_ROLE_OWNER || $user->{role} eq USER_ROLE_CREATOR);
}


1;
