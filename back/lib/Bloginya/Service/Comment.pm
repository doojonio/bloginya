package Bloginya::Service::Comment;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);

has 'db';
has 'redis';
has 'current_user';
has 'se_policy';


async sub list_by_post_p($self, $post_id) {
  die "no rights read post" unless await $self->se_policy->can_read_post_p($post_id);

  my $res = await $self->db->select_p(
    [\'comments c', [-left => \'users u', 'u.id' => 'c.user_id']],
    [
      'c.id',
      'c.created_at',
      'c.edited_at',
      'c.content',
      'u.username',
      [\"u.google_userinfo->>'picture'" => 'picture'],
      \'(select count(cl.*) from comment_likes cl where cl.comment_id = c.id) as likes',
      \'select (count(cr.id) from comments cr where cr.reply_to_id = c.id) as replies',
    ],
    {post_id  => $post_id},
    {order_by => {-desc => 'c.created_at'}},
  );

  $res->hashes;
}


1;
