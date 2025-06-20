package Bloginya::Service::Language;
use Mojo::Base -base, -signatures, -async_await;

has 'se_google';

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
    if ($category =~ /$_/i) {
      return &$_;
    }
  }
}

sub detect_by_chars ($self, $txt) {
  if ($txt =~ /\p{Script=Hiragana}|\p{Script=Katakana}/) {
    return JAPANESE;
  }
  elsif ($txt =~ /\p{Script=Han}/) {
    return CHINESE;
  }
  elsif ($txt =~ /\p{Script=Hangul}/) {
    return KOREAN;
  }
  elsif ($txt =~ /\p{Script=Cyrillic}/) {
    return RUSSIAN;
  }
  else {
    return ENGLISH;
  }
}

1;
