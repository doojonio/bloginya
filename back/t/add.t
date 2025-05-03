use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

my $url = '/users/api/v1/crud';

my $t = Test::Mojo->new('Bloginya');

$t->post_ok($url, json => {email => 'test@example.org', username => 'test', password => 'abcdefg123'})->status_is(200);

done_testing();
