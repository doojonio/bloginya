package Bloginya::Service::User;
use Mojo::Base -base, -signatures, -async_await;

use Mojo::IOLoop ();

has db => undef;

async sub create_user_p($self, %user) {
  my ($id) = (await $self->db->insert_p(
    'users',
    {
      email    => $user{email},
      username => $user{username},
      password => (await $self->_hash_pw_argon2_p($user{password})),
    },
    {returning => 'id'}
  ))->array->@*;

  return $id;
}

async sub _hash_pw_argon2_p ($self, $pw) {
  use Crypt::Argon2 qw(argon2_pass argon2_verify);

  ...;

  my $hashed_pass = await Mojo::IOLoop->subprocess->run_p(sub {

    # TODO: good randomization
    return argon2_pass('argon2id', $pw, rand, 3, '64mb', 16, 24);
  });

  return $hashed_pass;
}

async sub _verify_pw_argon2_p ($self, $pw, $hash) {
  use Crypt::Argon2 qw(argon2_pass argon2_verify);
  my $is_ok = await Mojo::IOLoop->subprocess->run_p(sub {
    argon2_verify($hash, $pw);
  });

  return $is_ok;
}

1
