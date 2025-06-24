package Bloginya::Controller::Comment;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental 'try';


async sub add_comment($self) {
  my $form = $self->i(json => 'AddCommentPayload');

  my $id = await $self->service('comment')->add_comment_p($form);

  return $self->render(json => $id);
}


1
