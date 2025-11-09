package Bloginya::Service::CleanUp;
use Mojo::Base -base, -signatures, -async_await;

use DateTime;
use DateTime::Duration;
use Mojo::Util qw(getopt);

has 'app';
has 'db';
has 'log';

sub estimate($self) {
  my $sessions_num = $self->_process_sessions();
  my ($files_count, $copies_count, $files_size) = $self->_process_unused_files();

  $self->log->info("ESTIMATED TO DELETE: $sessions_num sessions; "
      . "$files_count files, $copies_count copies, $files_size overall file size");

  return (
    sessions     => $sessions_num,
    files_count  => $files_count,
    copies_count => $copies_count,
    files_size   => $files_size
  );
}

sub cleanup ($self, @args) {
  my $deleted_sessions = $self->_process_sessions(1);
  my ($deleted_files, $deleted_copies, $deleted_size) = $self->_process_unused_files(1);

  $self->log->info("DELETED: $deleted_sessions sessions; "
      . "$deleted_files files, $deleted_copies copies, $deleted_size overall file size");
  return (
    sessions     => $deleted_sessions,
    files_count  => $deleted_files,
    copies_count => $deleted_copies,
    files_size   => $deleted_size,
  );
}

sub _process_unused_files ($self, $is_delete = 0) {
  my $files = $self->app->drive_path->list_tree;

  my sub _is_original { $_[0] =~ /original\.\w+$/ }
  my sub _upload_id   { (split(/\/\w+\.\w+$/, (split(/public\//, $_[0]))[1]))[0] }

  my $copies_count = 0;
  my $files_count  = 0;
  my $files_size   = 0;

  for my $file (@$files) {
    next unless _is_original($file);
    my $upload_id = _upload_id($file);
    my $is_used   = $self->_is_upload_id_used($upload_id);
    next if $is_used;

    $files_count++;
    my ($dir_size, $dir_copies) = $self->_estimate_upload_dir_size($upload_id);
    $copies_count += $dir_copies;
    $files_size   += $dir_size;

    if ($is_delete) {
      $self->_remove_upload($upload_id) unless $is_used;
    }
  }

  return ($files_count, $copies_count, $files_size);
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

sub _estimate_upload_dir_size($self, $upload_id) {
  my $path  = $self->app->drive_path->dirname->child($upload_id);
  my $files = $path->list_tree;

  my $size = 0;

  # do not count original
  my $copies_count = 0;
  for my $file (@$files) {
    next unless -f $file;
    $size += -s $file;

    next if $file =~ /original\./;
    $copies_count++;
  }

  return ($size, $copies_count);
}

sub _remove_upload ($self, $upload_id) {

  my $deleted = $self->app->db->delete('uploads', {id => $upload_id})->rows;
  my $path    = $self->app->drive_path->dirname->child($upload_id);
  $path->remove_tree;

  $self->app->log->info("removed dir $path (db: $deleted)");
  return $deleted, $path;
}

sub _process_sessions ($self, $is_delete = 0) {
  my $max_age_sec       = $self->app->config->{sessions}{max_age};
  my $cleanup_before_dt = DateTime->now()->subtract(seconds => $max_age_sec);

  $self->app->log->info('processing sessions before ' . $cleanup_before_dt);

  my %filter = (created_at => {'<=', "$cleanup_before_dt"},);

  my $rows;
  if ($is_delete) {
    my $result = $self->db->delete('sessions', \%filter);
    $rows = $result->rows;
  }
  else {
    $rows = $self->db->select('sessions', 'count(*)', \%filter)->arrays->first->[0];
  }

  $self->app->log->info("processed ($is_delete) " . $rows);

  return $rows;
}

1;
