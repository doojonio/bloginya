use Mojo::Base -strict;

use Test::More;
use Bloginya::Util::UUID qw(is_uuid);

subtest 'basic validation' => sub {
    plan tests => 4;
    ok(is_uuid('123e4567-e89b-12d3-a456-426614174000'), 'valid uuid v1');
    ok(!is_uuid('123e4567-e89b-12d3-a456-42661417400'), 'invalid: too short');
    ok(!is_uuid(undef), 'invalid: undef');
    ok(!is_uuid(''), 'invalid: empty string');
};

subtest 'case sensitivity' => sub {
    plan tests => 3;
    ok(!is_uuid('123E4567-E89B-12D3-a456-426614174000'), 'invalid: uppercase letters in hex parts');
    ok(is_uuid('123e4567-e89b-12d3-a456-426614174000'), 'valid: lowercase');
    ok(is_uuid('123e4567-e89b-12d3-A456-426614174000'), 'valid: uppercase in variant part');
};

subtest 'versions' => sub {
    plan tests => 6;
    ok(is_uuid('123e4567-e89b-12d3-a456-426614174000'), 'valid: v1');
    ok(is_uuid('123e4567-e89b-22d3-a456-426614174000'), 'valid: v2');
    ok(is_uuid('123e4567-e89b-32d3-a456-426614174000'), 'valid: v3');
    ok(is_uuid('123e4567-e89b-42d3-a456-426614174000'), 'valid: v4');
    ok(is_uuid('123e4567-e89b-52d3-a456-426614174000'), 'valid: v5');
    ok(!is_uuid('123e4567-e89b-62d3-a456-426614174000'), 'invalid: v6');
};

subtest 'variants' => sub {
    plan tests => 6;
    ok(is_uuid('123e4567-e89b-12d3-8456-426614174000'), 'valid: variant 8');
    ok(is_uuid('123e4567-e89b-12d3-9456-426614174000'), 'valid: variant 9');
    ok(is_uuid('123e4567-e89b-12d3-a456-426614174000'), 'valid: variant a');
    ok(is_uuid('123e4567-e89b-12d3-b456-426614174000'), 'valid: variant b');
    ok(is_uuid('123e4567-e89b-12d3-A456-426614174000'), 'valid: variant A');
    ok(is_uuid('123e4567-e89b-12d3-B456-426614174000'), 'valid: variant B');
};

subtest 'invalid characters' => sub {
    plan tests => 2;
    ok(!is_uuid('g23e4567-e89b-12d3-a456-426614174000'), 'invalid: non-hex character g');
    ok(!is_uuid('123e4567-e89b-12d3-a456-42661417400!'), 'invalid: special character !');
};


done_testing();
