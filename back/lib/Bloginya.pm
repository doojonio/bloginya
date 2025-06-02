package Bloginya;
use Mojo::Base 'Mojolicious', -signatures, -async_await;

use Mojo::Log ();

sub startup ($self) {
  my $config = $self->plugin('NotYAMLConfig');
  $self->secrets($config->{secrets});

  # Default helpers
  $self->plugin('DefaultHelpers');
  $self->plugin('Bloginya::Plugin::WebHelpers');
  $self->plugin('Bloginya::Plugin::DB');
  $self->plugin('Bloginya::Plugin::Service', {'di_tokens' => [qw(db redis)]});

  # $self->exception_format('json');

  # for files 50mb
  $self->max_request_size(5e+7);

  $self->_setup_routes;
  $self->_setup_commands;

  $self->helper(log => sub { Mojo::Log->new });

  $self->helper(test => sub ($self) { !!$self->config->{test} });
}

sub _setup_routes($self) {
  my $r = $self->routes;
  $r->get('/')->to(cb => sub { $_[0]->render(json => {status => 'up'}) });

  my $api = $r->any('/api');

  $api->get('/settings')->to('App#settings');

  $api->get('/oauth/to_google')->to('OAuth#to_google');
  $api->get('/oauth/from_google')->to('OAuth#from_google');

  $api->post('/drive')->to('File#put_file');

  $api->post('/posts')->to('Post#save');
  $api->get('/posts')->to('Post#get');
  $api->get('/posts/home')->to('Post#list_home');
  $api->get('/posts/list')->to('Post#list');
  $api->post('/posts/publish')->to('Post#publish');

  $api->post('/categories')->to('Category#save');
  $api->get('/categories/list')->to('Category#list');
  $api->get('/categories')->to('Category#get');
}

sub _setup_commands($self) {
  push $self->commands->namespaces->@*, 'Bloginya::Command';
}

1;
