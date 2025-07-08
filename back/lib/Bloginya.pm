package Bloginya;
use Mojo::Base 'Mojolicious', -signatures, -async_await;

use Carp         ();
use Scalar::Util qw(blessed);

sub startup ($self) {
  my $config = $self->plugin('NotYAMLConfig');
  $self->secrets($config->{secrets});

  $self->hook(
    'around_action' => sub {
      my ($next, $c, $action, $last) = @_;
      my $res = $next->();
      $res->catch(\&Carp::cluck) if blessed($res) && $res->isa('Mojo::Promise');
      $res;
    }
  );

  # Default helpers
  $self->plugin('DefaultHelpers');
  $self->plugin('Bloginya::Plugin::Log4perl');
  $self->plugin('Bloginya::Plugin::WebHelpers');
  $self->plugin('Bloginya::Plugin::DB');
  $self->plugin(
    'Bloginya::Plugin::Service',
    {
      'di_tokens' => [
        qw(app config current_user log),
        [db    => 'db_lazy',    'Bloginya::ServiceRole::LazyDB'],
        [redis => 'redis_lazy', 'Bloginya::ServiceRole::LazyRedis']
      ]
    }
  );
  $self->plugin('Bloginya::Plugin::CoolIO', {namespaces => ['Bloginya::Schema']});

  $self->exception_format('json');    # Enable JSON format for exceptions
  $self->types->type('webp' => ['image/webp']);

  # for files 100mb
  $self->max_request_size(100_000_000);

  $self->_setup_routes;
  $self->_setup_commands;

  $self->helper(test => sub ($self) { !!$self->config->{test} });
}

sub _setup_routes($self) {
  my $r = $self->routes;
  $r->get('/')->to(
    cb => sub {
      $_[0]->render(json => {status => 'up'});
    }
  );

  my $api = $r->any('/api');

  # detect user
  my $api_U = $api->under(
    '/' => sub ($c) {
      $c->current_user_p->then(sub ($u) {
        if ($u && $u->{status} eq 'blocked') {
          return $c->msg('BLOCKED', 403);
        }

        $c->continue;
      })->catch(sub ($e) {
        $c->reply->exception($e);
      });

      return undef;
    }
  );

  # Unauthorized routes
  $api_U->get('/categories')->to('Category#get');
  $api_U->get('/categories/list')->to('Category#list');
  $api_U->get('/categories/load')->to('Category#load_category');
  $api_U->get('/oauth/from_google')->to('OAuth#from_google');
  $api_U->get('/oauth/to_google')->to('OAuth#to_google');
  $api_U->get('/posts')->to('Post#get');
  $api_U->get('/posts/home')->to('Post#list_home');
  $api_U->get('/posts/list')->to('Post#list');
  $api_U->get('/settings')->to('App#settings');
  $api_U->get('/shortnames/item')->to('Shortname#get_item_by_name');
  $api_U->get('/posts/similliar')->to('Post#search_similliar_posts');
  $api_U->get('/posts/by_category')->to('Post#list_by_category');
  $api_U->get('/comments')->to('Comment#list_by_post');
  $api_U->get('/search')->to('Search#search');

  # Authorized routes
  my $api_A = $api->under(
    '/' => sub ($c) {
      $c->current_user_p->then(sub ($u) {

        unless ($u) {
          $c->render(json => {message => 'Unauthorized'}, status => 401);
          return;
        }
        if ($u->{status} eq 'blocked') {
          return $c->msg('BLOCKED', 403);
        }

        return $c->continue;
      })->catch(sub ($e) {
        $c->reply->exception($e);
      });

      return undef;
    }
  );

  $api_A->delete('/comments/like')->to('Comment#unlike');
  $api_A->delete('/posts/like')->to('Post#unlike');
  $api_A->get('/categories/by_title')->to('Category#get_by_title');
  $api_A->get('/posts/drafts')->to('Post#drafts');
  $api_A->get('/posts/for_edit')->to('Post#get_for_edit');
  $api_A->get('/shortnames')->to('Shortname#get_by_name');
  $api_A->post('/categories')->to('Category#save');
  $api_A->put('/categories')->to('Category#update');
  $api_A->get('/categories/for_edit')->to('Category#get_for_edit');
  $api_A->post('/comments/like')->to('Comment#like');
  $api_A->post('/drive')->to('Drive#put_file');
  $api_A->post('/posts/like')->to('Post#like');
  $api_A->post('/posts/new')->to('Post#create_draft');
  $api_A->post('/posts/publish')->to('Post#publish');
  $api_A->post('comments')->to('Comment#add_comment');
  $api_A->put('/posts/draft')->to('Post#update_draft');
  $api_A->put('posts')->to('Post#apply_changes');
  $api_A->delete('/comments')->to('Comment#delete');
  $api_A->post('/users/block')->to('User#block');

  $r->get('/drive/*upload_id')->to('Drive#get_file');
}


sub _setup_commands($self) {
  push $self->commands->namespaces->@*, 'Bloginya::Command';
}

1;
