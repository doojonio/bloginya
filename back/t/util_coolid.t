use Mojo::Base -strict;

use Test::More;
use Bloginya::Util::CoolId qw(is_cool_id);

ok(is_cool_id('aBcDeFgHiJkL'), 'valid id');
ok(!is_cool_id('aBcDeFgHiJk'), 'too short');
ok(!is_cool_id('aBcDeFgHiJkLm'), 'too long');
ok(!is_cool_id('aBcDeFgHiJk!'), 'invalid characters');
ok(!is_cool_id(undef), 'undef');
ok(!is_cool_id(''), 'empty string');

done_testing();
