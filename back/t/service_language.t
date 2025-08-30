use Mojo::Base -strict;

use Test::More;
use Future::AsyncAwait;
use Bloginya::Service::Language;

# Mock for the logger
{package MockLogger; sub new {bless {}, shift} sub trace {} sub debug {} sub info {} sub warn {}}

my $lang_service = Bloginya::Service::Language->new(log => MockLogger->new);

# Tests for detect_by_category
subtest 'detect_by_category' => sub {
    plan tests => 7;

    is($lang_service->detect_by_category('CHINESE'), 'zh', 'Chinese category');
    is($lang_service->detect_by_category('RUSSIAN'), 'ru', 'Russian category');
    is($lang_service->detect_by_category('ENGLISH'), 'en', 'English category');
    is($lang_service->detect_by_category('JAPANESE'), 'ja', 'Japanese category');
    is($lang_service->detect_by_category('KOREAN'), 'ko', 'Korean category');
    is($lang_service->detect_by_category('FRENCH'), undef, 'Non-matching category');
    is($lang_service->detect_by_category(undef), undef, 'Undef category');
};

# Tests for detect_by_chars
subtest 'detect_by_chars' => sub {
    plan tests => 7;

    is($lang_service->detect_by_chars('こんにちは'), 'ja', 'Japanese text');
    is($lang_service->detect_by_chars('你好'), 'zh', 'Chinese text');
    is($lang_service->detect_by_chars('안녕하세요'), 'ko', 'Korean text');
    is($lang_service->detect_by_chars('Привет'), 'ru', 'Russian text');
    is($lang_service->detect_by_chars('Hello'), 'en', 'English text');
    is($lang_service->detect_by_chars('Hello, 你好'), 'en', 'Mixed text with more English');
    is($lang_service->detect_by_chars(''), 'en', 'Empty string defaults to English');
};

done_testing();