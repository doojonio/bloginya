package Bloginya::Service::Comment;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use List::Util qw(any);

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Bloginya::Model::Post qw(POST_STATUS_DEL);

has 'db';
has 'redis';
has 'current_user';
has 'se_policy';


async sub list_by_post_p($self, $post_id, $reply_to_id = undef) {
  die "no rights read post" unless await $self->se_policy->can_read_post_p($post_id);

  my @more_sel;
  if (my $u = $self->current_user) {
    push @more_sel, \[
      '(
        select
          exists(
            select 1 from comment_likes
            where comment_id = c.id and user_id = (?)
          )
        ) as liked ', $u->{id}
    ];
  }

  my $res = await $self->db->select_p(
    [
      \'comments c',
      [-left => \'users u', 'u.id' => 'c.user_id'],
      [-left => \'comment_audios ca', 'ca.comment_id' => 'c.id'],
    ],
    [
      'c.id',
      'c.user_id',
      'c.created_at',
      'c.edited_at',
      'c.content',
      'u.username',
      [\"u.google_userinfo->>'picture'" => 'picture'],
      ['ca.upload_id' => 'audio_upload_id'],
      \'(select count(cl.*) from comment_likes cl where cl.comment_id = c.id) as likes',
      \'(select count(cr.id) from comments cr where cr.reply_to_id = c.id and cr.status = \'ok\') as replies',
      @more_sel,
    ],
    {post_id  => $post_id, reply_to_id => $reply_to_id, 'c.status' => 'ok'},
    {order_by => {($reply_to_id ? '-asc' : '-desc') => 'c.created_at'}},
  );

  $res->hashes;
}

async sub add_comment_p($self, $fields) {
  die 'no rights to create comment on this post' unless await $self->se_policy->can_read_post_p($fields->{post_id});
  die 'unauthorized'                             unless $self->current_user;

  my %fields = map { $_ => $fields->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw(post_id reply_to_id content)
  } keys %$fields;

  $fields{user_id} = $self->current_user->{id};

  my $upload_id = $fields->{upload_id};

  # Validate upload_id if provided
  if ($upload_id) {
    my $upload = (await $self->db->select_p('uploads', ['user_id', 'mtype', 'service'], {id => $upload_id}))->hashes->first;
    die 'upload not found' unless $upload;

    # Verify upload belongs to current user
    die 'no rights to use this upload' unless $upload->{user_id} eq $self->current_user->{id};

    # Verify it's an audio file (either mtype starts with 'audio/' or service is 'cool_audio')
    unless ($upload->{mtype} =~ /^audio\// || ($upload->{service} && $upload->{service} eq 'cool_audio')) {
      die 'upload is not an audio file';
    }
  }

  my $tx = $self->db->begin;

  my $res = await $self->db->insert_p('comments', \%fields, {returning => 'id'});
  my $comment_id = $res->hashes->first->{id};

  # Insert into comment_audios if upload_id is provided
  if ($upload_id) {
    await $self->db->insert_p('comment_audios', {
      comment_id => $comment_id,
      upload_id => $upload_id,
    });
  }

  $tx->commit;

  return $comment_id;
}

async sub like_p ($self, $comment_id) {
  die 'no rights' unless my $u = $self->current_user;
  await $self->db->insert_p('comment_likes', {user_id => $u->{id}, comment_id => $comment_id}, {on_conflict => undef});
}
async sub unlike_p ($self, $comment_id) {
  die 'no rights' unless my $u = $self->current_user;
  await $self->db->delete_p('comment_likes', {user_id => $u->{id}, comment_id => $comment_id});
}

async sub delete_p($self, $comment_id) {
  die 'no rights' unless my $u = $self->current_user;

  my $com = (await $self->db->select_p('comments', ['user_id'], {id => $comment_id}))->hashes->first;
  die 'no rights' if $com->{user_id} ne $u->{id} && $u->{role} ne 'owner';

  my $tx = $self->db->begin;
  await $self->db->update_p('comments', {status => 'deleted'},
    {-or => [id => $comment_id, reply_to_id => $comment_id]});

  $tx->commit;
}

async sub list_deleted_comments ($self) {
  die 'no rights' unless my $current_user = $self->current_user;
  die 'no rights' unless $current_user->{role} eq 'owner';


  my $res = (await $self->db->query_p(
    q~
    WITH RECURSIVE CommentSubtree AS (
      SELECT id
      FROM comments
      WHERE status = ?
        OR post_id in (select id from posts where status = ?)

      UNION

      SELECT c.id
      FROM comments c
        INNER JOIN CommentSubtree cs ON c.reply_to_id = cs.id
    )
    SELECT
      u.id as user_id,
      u.username,
      u.google_userinfo->>'picture' as user_picture,

      p.title as post_title,
      p.id as post_id,
      sn.name as post_name,

      c.id,
      c.content,
      c.created_at

    FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN posts p ON c.post_id = p.id
      JOIN shortnames sn ON p.id = sn.post_id

    WHERE c.id IN (SELECT id FROM CommentSubtree)
    ORDER BY c.created_at DESC
  ~, 'deleted', POST_STATUS_DEL
  ))->hashes;

  return $res;
}


1;
