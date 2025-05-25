package Bloginya;
use Mojo::Base 'Mojolicious', -signatures, -async_await;

use Mojo::Log ();

sub startup ($self) {
  my $config = $self->plugin('NotYAMLConfig');
  $self->secrets($config->{secrets});

  # Default helpers
  $self->plugin('DefaultHelpers');
  $self->plugin('Bloginya::Plugin::WebHelpers');
  $self->plugin('Bloginya::Plugin::Service');
  $self->plugin('Bloginya::Plugin::DB');

  # $self->exception_format('json');

  # for files 50mb
  $self->max_request_size(5e+7);

  $self->_setup_routes;
  $self->_setup_commands;

  my $log = Mojo::Log->new;
  $SIG{__WARN__} = sub {
    $log->warn(shift);
  };

  $self->helper(log => sub {$log});

  $self->helper(test => sub ($self) { !!$self->config->{test} });
}

sub _setup_routes($self) {
  my $r = $self->routes;
  $r->get('/')->to(cb => sub { $_[0]->render(json => {status => 'up'}) });

  my $api = $r->any('/api');

  $api->get('/cdata')->to('App#common_data');

  $api->get('/oauth/to_google')->to('OAuth#to_google');
  $api->get('/oauth/from_google')->to('OAuth#from_google');

  $api->post('/drive')->to('File#put_file');

  $api->post('/blogs')->to('Blog#save');
  $api->get('/blogs')->to('Blog#get');
  $api->get('/blogs/list')->to('Blog#list');
  $api->post('/blogs/publish')->to('Blog#publish');

  $api->post('/collections')->to('Collection#save');
  $api->get('/collections/list')->to('Collection#list');
  $api->get('/collections')->to('Collection#get');
}

sub _setup_commands($self) {
  push $self->commands->namespaces->@*, 'Bloginya::Command';
}

1;
