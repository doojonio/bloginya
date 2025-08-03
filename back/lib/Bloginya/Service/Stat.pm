package Bloginya::Service::Stat;
use Mojo::Base -base, -signatures, -async_await;

use Bloginya::Model::UserActionLog qw(LOG_TYPE_SHORTVIEW LOG_TYPE_MEDIUMVIEW LOG_TYPE_LONGVIEW);

has 'db';
has 'current_user';
has 'redis';

async sub add_stat_p($self, $post_id, $view_type) {
  my $user = $self->current_user;

  my $tx = $self->db->begin;

  await $self->_ensure_stat_exists($post_id);

  # select for update
  my $stat = (await $self->db->select_p(
    'post_stats',
    ['short_views', 'medium_views', 'long_views'],
    {post_id => $post_id},
    {for     => 'update'},
  ))->hashes->first;

  my %form;

  my $log_type = LOG_TYPE_SHORTVIEW;
  if ($view_type eq 'short') {
    $form{short_views} = $stat->{short_views} + 1;
    $log_type = LOG_TYPE_SHORTVIEW;
  }
  elsif ($view_type eq 'medium') {
    $form{medium_views} = $stat->{medium_views} + 1;
    $log_type = LOG_TYPE_MEDIUMVIEW;

  }
  elsif ($view_type eq 'long') {
    $form{long_views} = $stat->{long_views} + 1;
    $log_type = LOG_TYPE_LONGVIEW;
  }

  await $self->db->update_p('post_stats', \%form, {post_id => $post_id});

  # user action log
  # if ($user) {
  #   await $self->db->insert_p('user_action_log',
  #     {user_id => $user->{id}, type => $log_type, data => {-json => {post_id => $post_id}},});
  # }

  $tx->commit;
}

async sub _ensure_stat_exists ($self, $post_id) {
  return await $self->db->insert_p('post_stats', {post_id => $post_id}, {on_conflict => undef});
}

async sub get_views_p($self, $post_id) {
  my $user = $self->current_user;
  die 'no rights' unless $user->{role} eq 'owner';

  my $stats
    = await $self->db->select_p('post_stats', ['short_views', 'medium_views', 'long_views'], {post_id => $post_id},);

  return $stats->hashes->first;
}


1;
