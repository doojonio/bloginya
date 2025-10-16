package Bloginya::Command::cleanup;
use Mojo::Base 'Mojolicious::Command', -signatures;

use DateTime;
use DateTime::Duration;
use Mojo::Util qw(getopt);

has description => 'Clean up sessions and unused uploads';
has usage       => sub ($self) { $self->extract_usage };

sub run ($self, @args) {
  die $self->usage unless getopt \@args, 'q|quiet' => \my $quiet;
  $self->quiet($quiet);

  $self->_delete_sessions();
  $self->_delete_unused_files();
}

sub _delete_unused_files ($self) {
  my $files = $self->app->drive_path->list_tree;

  my sub _is_original { $_[0] =~ /original\.\w+$/ }
  my sub _upload_id   { (split(/\/\w+\.\w+$/, (split(/public\//, $_[0]))[1]))[0] }

  for my $file (@$files) {
    next unless _is_original($file);
    my $upload_id = _upload_id($file);
    my $is_used   = $self->_is_upload_id_used($upload_id);
    $self->_remove_upload($upload_id) unless $is_used;
  }
}

sub _is_upload_id_used ($self, $upload_id) {
  my $db = $self->app->db;
  return !!$db->query(
    'select 1
      from (select ? as id) u
      where
      exists(select from uploads where id = u.id)
      and (
        exists(select from posts where picture_pre = u.id or picture_wp = u.id)
        or exists(select from post_drafts where picture_pre = u.id or picture_wp = u.id)
        or exists(select from post_uploads where upload_id = u.id)
      )
      ', $upload_id
  )->rows;
}

sub _remove_upload ($self, $upload_id) {

  my $deleted = $self->app->db->delete('uploads', {id => $upload_id})->rows;
  my $path    = $self->app->drive_path->dirname->child($upload_id);
  $path->remove_tree;

  $self->app->log->info("removed dir $path (db: $deleted)");
  return $deleted, $path;
}

sub _delete_sessions ($self) {
  my $max_age_sec       = $self->app->config->{sessions}{max_age};
  my $cleanup_before_dt = DateTime->now()->subtract(seconds => $max_age_sec);

  $self->app->log->info('deleting sessions before ' . $cleanup_before_dt);

  my $result = $self->app->db->delete('sessions', {created_at => {'<=', "$cleanup_before_dt"}});

  my $deleted_rows = $result->rows;

  $self->app->log->info('deleted ' . $deleted_rows);
}

1;

=head1 SYNOPSIS

  Usage: bloginya cleanup

=cut
