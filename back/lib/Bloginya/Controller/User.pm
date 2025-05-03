package Bloginya::Controller::User;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use Bloginya::Service::User    ();
use Bloginya::Service::Session ();

async sub add ($self) {
  my $form = $self->req->json;
  my $db   = $self->db;

  my $tx = $db->begin;

  my $u_serv    = Bloginya::Service::User->new(db => $db);
  my $sess_serv = Bloginya::Service::Session->new(db => $db, redis => $self->redis);

  my $id = await $u_serv->create_user_p(email => $form->{email}, username => $form->{username},
    password => $form->{password});
  my ($sid) = await $sess_serv->create_session_p($id, $self->real_ip, $self->client_app);

  # my $postal = Bloginya::Service::Postal->new();
  # $postal->send_email(1, {});
  $self->set_sid($sid);

  $tx->commit;

  return $self->render({user_id => $id});
}

async sub check_user_existance ($self) {
  my ($k_templ, %filter) = ('saram:echeck:%s',);

  if (my $uname = $self->param('username')) {
    $filter{username} = $uname;
  }
  elsif (my $email = $self->param('email')) {
    $filter{email} = $email;
  }
  else {
    $self->render(status => 400);
  }

  my $redis  = $self->redis;
  my $rdskey = sprintf($k_templ, values %filter);
  if (defined(my $cache = await $redis->get_p($rdskey))) {
    return $self->render(json => {exists => !!$cache});
  }

  my $exists = !!(await $self->db->select_p('users', '1', \%filter))->rows;
  await $redis->set_p($rdskey, $exists);

  return $self->render(json => {exists => $exists});
}

1
