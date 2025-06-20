package Bloginya::Service::ProseMirror;
use Mojo::Base -base, -signatures;

use Bloginya::Model::ProseMirror qw(is_text is_image);
use Bloginya::Model::Upload      qw(upload_id);
use Ref::Util                    qw(is_arrayref is_ref);
use Iterator::Simple             qw(:all);

use constant AVERAGE_WPM => 130;

sub iterate($self, $doc) {
  my @elements = $doc->{content}->@*;

  iterator {
    my $el = shift @elements;

    return unless $el;

    if (my $content = $el->{content}) {
      unshift @elements, $content->@*;
    }

    $el;
  }
}

sub it_img_ids($self) {

  my @ids;

  return sub {
    return \@ids unless @_;
    push @ids, map { upload_id($_) } grep {$_} map { $_->{attrs}{src} } grep { is_image($_) } @_;
    @_;
  }
}

sub it_text($self) {
  my @text;

  return sub {
    return join(' ', @text) unless @_;
    push @text, map { $_->{text} } grep { is_text($_) } @_;
    @_;
  }
}

sub it_wc($self) {
  my $count = 0;

  return sub {
    return $count unless @_;
    if ($_[0] && is_text($_[0])) {
      $count += grep {/\w+/} split(/\b/, $_[0]->{text});
    }

    @_;
  }
}

sub it_ttr($self) {
  my $it_wc = $self->it_wc;

  return sub {
    return $it_wc->() / AVERAGE_WPM unless @_;
    $it_wc->($_[0]);
  }
}

1;
