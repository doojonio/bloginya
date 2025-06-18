package Bloginya::Service::ProseMirror;
use Mojo::Base -base, -signatures, -async_await;

use Ref::Util qw(is_arrayref is_ref);

use constant AVERAGE_WPM => 130;


sub get_all_images($self, $doc) {
  my @elements = $doc->{content}->@*;

  my @pic_els;
  while (my $el = shift @elements) {
    if ($el->{type} eq 'image') {
      push @pic_els, $el;
    }

    if (my $content = $el->{content}) {
      unshift @elements, $content->@*;
    }
  }

  return \@pic_els;
}

sub get_words_count($self, $doc) {
  my @elements = $doc->{content}->@*;

  my $count = 0;
  while (my $el = shift @elements) {
    if ($el->{type} eq 'text' && (my $txt = $el->{text})) {
      $count += grep {/\w+/} split(/\b/, $txt);
    }
    elsif (is_arrayref($el->{content})) {
      push @elements, $el->{content}->@*;
    }
  }

  $count;
}

sub estimate_ttr_min($self, $doc) {
  my $wc = $self->get_words_count($doc);

  return $wc / AVERAGE_WPM;
}

1;
