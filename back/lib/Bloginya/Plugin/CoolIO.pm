package Bloginya::Plugin::CoolIO;
use Mojo::Base 'Mojolicious::Plugin', -signatures, -async_await;

use experimental qw(try);

use Bloginya::Util::CoolId qw(is_cool_id);
use Bloginya::Util::UUID   qw(is_uuid);
use Ref::Util              qw(is_hashref is_arrayref is_ref);
use Scalar::Util           qw(looks_like_number blessed);
use Mojo::Loader           qw(load_classes);

use Bloginya::Plugin::CoolIO::DefaultSchemaList ();

use constant 'Exc'  => __PACKAGE__ . '::_Exception';
use constant MUTATE => 1;

has 'lists' => sub { [__PACKAGE__ . '::DefaultSchemaList'] };

sub register {
  my ($self, $app, $cfg) = @_;

  my $namespaces = $cfg->{namespaces};
  if ($namespaces) {
    push $self->lists->@*, load_classes($_) for @$namespaces;
  }

  $app->helper('i', sub { $self->_input(@_) });
  $app->hook('around_action', \&_hook);
}

sub _hook {
  my ($next, $c, $action, $last) = @_;
  my $res;
  try {
    $res = $action->($c);
  }
  catch ($e) {
    return _handle_err($e, $c);
  }

  if (blessed($res) && $res->isa('Mojo::Promise')) {
    $res->catch(sub { _handle_err(shift, $c) });
  }

  return $res;
}

sub _handle_err ($e, $c) {
  if (blessed($e) && $e->isa(Exc)) {
    $c->msg($e->message, 400);
  }
  else {
    $c->reply->exception($e);
  }
}

sub _input {
  my ($self, $c) = (shift, shift);
  my @ret;

  while (@_) {
    my ($name, $conf) = (shift, shift);

    my $v    = $name eq 'json' ? $c->req->json : $c->param($name);
    my @cfgs = $self->_get_variants($conf);

    my @tests = map { [$v, $self->_expand_cfg($_)] } @cfgs;

    unless ($self->validate(\@tests)) {
      die Exc->new("$name invalid");
    }
    push @ret, $v;
  }

  wantarray ? @ret : $ret[0];
}

sub validate($self, $tests) {
  my @queue = ($tests);

  while (my $tests = shift @queue) {
    my $ok = 0;

    for my $test (@$tests) {
      my ($v, $cfg, @cfg_args) = @$test;

      if (!is_ref($cfg)) {
        my $f = $self->get_schema($cfg);
        if ($f->($self, $v, @cfg_args)) {
          $ok++;
          last;
        }
        else {
          warn $v // 'undef' . " - $cfg failed";
        }
      }
      elsif (is_hashref($cfg)) {
        if ($self->_hash_validate($v, $cfg, \@queue)) {
          $ok++;
          last;
        }
        else {
          warn "failed hashref";
        }
      }
      elsif (is_arrayref($cfg)) {
        if ($self->_arr_validate($v, $cfg, \@queue)) {
          $ok++;
          last;
        }
        else {
          warn "failed array";
        }
      }
      else {
        die "invalid cfg: $cfg";
      }
    }

    return undef unless $ok;
  }

  return 1;
}

sub get_schema ($self, $name) {
  for my $list ($self->lists->@*) {
    my $f = $list->can("schema_$name");
    return $f if $f;
  }

  die "invalid schema $name";
}


sub _get_variants($self, $cfgs_str) {
  return $cfgs_str if is_ref($cfgs_str);
  split(/\|/, $cfgs_str);
}

sub _expand_cfg($self, $name) {
  return $name if is_ref($name);

  my @args;
  if ($name =~ / (\w+)  \[ ([\w,]+) \] /x) {
    $name = $1;
    @args = split /,/, $2;
  }

  return $name, @args;
}

sub _hash_validate($self, $v, $cfg, $queue) {
  return unless is_hashref($v);

  if (MUTATE) {
    my @extra_keys = grep { !exists($cfg->{$_}) } keys %$v;

    if (@extra_keys) {
      local $" = ", ";
      warn "extra keys: @extra_keys";
      delete @{$v}{@extra_keys};
    }
  }

  while (my ($k, $cfg) = each(%$cfg)) {
    my $v = $v->{$k};
    push @$queue, [map { [$v, $self->_expand_cfg($_)] } $self->_get_variants($cfg)];
  }

  return 1;
}

sub _arr_validate($self, $v, $cfg, $queue) {
  die 'invalid array cfg' if @$cfg != 1;
  return unless is_arrayref($v);

  my @variants = map { [$self->_expand_cfg($_)] } $self->_get_variants($cfg->[0]);
  for my $value (@$v) {
    push @$queue, [map { [$value, @$_] } @variants];
  }
  return 1;
}

package Bloginya::Plugin::CoolIO::_Exception {
  use Mojo::Base 'Mojo::Exception', -signatures;
};

1;
