package Bloginya::Command::250731_ordered_list;
use Mojo::Base 'Mojolicious::Command', -signatures;

use Mojo::Util qw(getopt);

has description => 'Fix ordered lists with null order';
has usage       => sub ($self) { $self->extract_usage };

sub run ($self, @args) {
  die $self->usage unless getopt \@args, 'q|quiet' => \my $quiet;
  $self->quiet($quiet);

  my $db = $self->app->db;

  my $posts
    = $db->query(q/SELECT post_id, document FROM post_drafts WHERE document::text ~* 'ordered_list'/)->expand->hashes;

  my $ps = $self->app->service('prose_mirror');
  for my $post (@$posts) {
    my $is_update = 0;
    my $it        = $ps->iterate($post->{document});
    while (my $el = <$it>) {
      if ($el->{type} eq 'ordered_list' && exists $el->{attrs}{order} && !defined($el->{attrs}{order})) {
        $el->{attrs}{order} = 1;
        $is_update++;
      }
    }

    if ($is_update) {
      $self->_loud("Updating post " . $post->{post_id});
      $db->update('post_drafts', {document => {-json => $post->{document}}}, {post_id => $post->{post_id}});
    }
  }
}

1;

=head1 SYNOPSIS


=cut
