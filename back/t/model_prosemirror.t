use Mojo::Base -strict;

use Test::More;
use Bloginya::Model::ProseMirror qw(is_image is_text);

subtest 'is image' => sub {
  plan tests => 5;
  ok(is_image({type => 'image'}), 'is_image: valid image element');
  ok(!is_image({type => 'text'}), 'is_image: not an image element');
  ok(!is_image({}),               'is_image: empty hash');
  ok(!is_image(undef),            'is_image: undef');
  ok(!is_image('image'),          'is_image: just a string');
};

subtest 'is text' => sub {
  plan tests => 7;
  ok(is_text({type => 'text', text => 'hello'}),   'is_text: valid text element');
  ok(is_text({type => 'text', text => ''}),        'is_text: valid text element with empty text');
  ok(!is_text({type => 'text'}),                   'is_text: missing text key');
  ok(!is_text({type => 'image', text => 'hello'}), 'is_text: not a text element');
  ok(!is_text({}),                                 'is_text: empty hash');
  ok(!is_text(undef),                              'is_text: undef');
  ok(!is_text('text'),                             'is_text: just a string');
};

done_testing();
