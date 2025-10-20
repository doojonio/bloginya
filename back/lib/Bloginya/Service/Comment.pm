package Bloginya::Service::Comment;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use List::Util qw(any);

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);

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
    [\'comments c', [-left => \'users u', 'u.id' => 'c.user_id']],
    [
      'c.id',
      'c.user_id',
      'c.created_at',
      'c.edited_at',
      'c.content',
      'u.username',
      [\"u.google_userinfo->>'picture'" => 'picture'],
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

  my $res = await $self->db->insert_p('comments', \%fields, {returning => 'id'});
  return $res->hashes->first->{id};
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


1;
