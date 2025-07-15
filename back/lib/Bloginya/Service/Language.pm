package Bloginya::Service::Language;
use Mojo::Base -base, -signatures, -async_await;

has 'se_google';
has 'log';

use constant {CHINESE => 'zh', RUSSIAN => 'ru', ENGLISH => 'en', JAPANESE => 'ja', KOREAN => 'ko'};

async sub detect_lang_p($self, $txt, $category_name = undef) {

  my $lang;

  # TODO google detection
  # await $self->detect_by_google_translate_p($self, $txt);

  return $self->detect_by_category($category_name) || $self->detect_by_chars($txt);
}

async sub detect_by_google_translate_p($self, $txt) {
  ...;
  $self->se_google;
}

sub detect_by_category ($self, $category) {
  return unless $category;
  for (qw(CHINESE RUSSIAN ENGLISH JAPANESE KOREAN)) {
    if ($category =~ /^$_$/i) {
      return __PACKAGE__->can($_)->();
    }
  }
}

sub detect_by_chars ($self, $txt) {

  # detect by count of characters
  my %count;
  for my $char (split //, $txt) {
    if ($char =~ /\p{Script=Hiragana}|\p{Script=Katakana}/) {
      $count{&JAPANESE()}++;
    }
    elsif ($char =~ /\p{Script=Han}/) {
      $count{&CHINESE()}++;
    }
    elsif ($char =~ /\p{Script=Hangul}/) {
      $count{&KOREAN()}++;
    }
    elsif ($char =~ /\p{Script=Cyrillic}/) {
      $count{&RUSSIAN()}++;
    }
    elsif ($char =~ /\p{Script=Latin}/) {
      $count{&ENGLISH()}++;
    }
  }

  my $max_lang;
  my $max_count = 0;
  for my $lang (keys %count) {
    if ($count{$lang} > $max_count) {
      $max_count = $count{$lang};
      $max_lang  = $lang;
    }
  }

  return $max_lang || ENGLISH;
}

1;
