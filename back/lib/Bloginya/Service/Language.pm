package Bloginya::Service::Language;
use Mojo::Base -base, -signatures, -async_await;

has 'se_google';
has 'log';

use constant {CHINESE => 'zh', RUSSIAN => 'ru', ENGLISH => 'en', JAPANESE => 'ja', KOREAN => 'ko'};

async sub detect_lang_p($self, $txt, $category_name = undef) {
  $self->log->debug("Detecting language" . ($category_name ? " with category hint '$category_name'" : ""));

  # TODO google detection
  # await $self->detect_by_google_translate_p($self, $txt);

  my $lang = $self->detect_by_category($category_name) || $self->detect_by_chars($txt);
  $self->log->info("Detected language as '$lang'");
  return $lang;
}

async sub detect_by_google_translate_p($self, $txt) {
  ...;
  $self->se_google;
}

sub detect_by_category ($self, $category) {
  return unless $category;
  $self->log->trace("Attempting to detect language by category: '$category'");
  for (qw(CHINESE RUSSIAN ENGLISH JAPANESE KOREAN)) {
    if ($category =~ /^$_$/i) {
      my $lang = __PACKAGE__->can($_)->();
      $self->log->debug("Detected language '$lang' from category name '$category'");
      return $lang;
    }
  }
  $self->log->trace("Could not detect language from category name '$category'");
  return;
}

sub detect_by_chars ($self, $txt) {
  $self->log->trace("Attempting to detect language by character analysis");

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

  my $counts_str = join(', ', map {"$_: $count{$_}"} sort keys %count);
  $self->log->trace("Character counts: " . ($counts_str || 'none'));

  my $max_lang;
  my $max_count = 0;
  for my $lang (keys %count) {
    if ($count{$lang} > $max_count) {
      $max_count = $count{$lang};
      $max_lang  = $lang;
    }
  }

  my $detected = $max_lang || ENGLISH;
  if ($max_lang) {
    $self->log->debug("Detected language '$detected' from character analysis");
  }
  else {
    $self->log->warn("Could not determine dominant language from characters, defaulting to '$detected'");
  }
  return $detected;
}

1;
