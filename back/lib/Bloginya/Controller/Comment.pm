package Bloginya::Controller::Comment;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub list_by_post($self) {
  my ($post_id) = $self->i(post_id => 'cool_id');

  my $comments;
  try {
    $comments = await $self->service('comment')->list_by_post_p($post_id);
  }
  catch ($e) {
    if ($e =~ /no rights/) {
      return $self->msg('NORIGHT', 403);
    }
    else {
      die $e;
    }
  }

  return $self->render(json => $comments);

}
async sub add_comment($self) {
  my $form = $self->i(json => 'AddCommentPayload');

  my $id = await $self->service('comment')->add_comment_p($form);

  return $self->render(json => $id);
}


1
