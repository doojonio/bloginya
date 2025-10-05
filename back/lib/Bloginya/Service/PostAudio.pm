package Bloginya::Service::PostAudio;
use Mojo::Base -base, -signatures, -async_await;

use SQL::Abstract::Pg;
use List::Util qw(uniq);

has 'db';
has 'redis';
has 'current_user';
has 'log';

async sub apply_post_audios_p($self, $post_id) {

  await $self->db->delete_p('post_audios', {post_id => $post_id});
  await $self->db->query_p(
    qq~
      insert into post_audios (post_id, audio_id)
      select post_id, audio_id from post_draft_audios pda where pda.post_id = (?)
      on conflict do nothing~, $post_id
  );
  await $self->db->delete_p('post_draft_audios', {post_id => $post_id});
}

async sub apply_post_draft_audios_p($self, $post_id, $audio_ids) {
  $self->log->debug(qq/Applying audios for post draft $post_id: / . (@$audio_ids ? join ', ', @$audio_ids : 'none'));
  await $self->db->delete_p('post_draft_audios', {post_id => $post_id});
  return unless @$audio_ids;

  my @values = map { {post_id => $post_id, audio_id => $_} } @$audio_ids;

  await $self->db->query_p(
    q~
      insert into post_draft_audios (post_id, audio_id) values ~
      . join(', ', map {"(?,?)"} @values),

    map { ($_->{post_id}, $_->{audio_id}) } @values,
  );

  $self->log->info("Applied " . scalar(@$audio_ids) . " audios to post draft $post_id");
}

async sub copy_post_audio_to_draft_p($self, $post_id) {
  await $self->db->query_p(
    qq~
      insert into post_draft_audios (post_id, audio_id)
      select post_id, audio_id from post_audios pa where pa.post_id = (?)
      on conflict do nothing~, $post_id
  );
}

1;
