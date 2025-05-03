use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('Bloginya');
$t->get_ok('/')->status_is(200)->json_is('/status' => 'up');

done_testing();
