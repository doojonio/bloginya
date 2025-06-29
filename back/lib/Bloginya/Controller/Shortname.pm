package Bloginya::Controller::Shortname;
use Mojo::Base 'Mojolicious::Controller', -signatures, -async_await;

use experimental qw(try);

async sub get_by_name ($self) {
  my $name = $self->i(name => 'sname');
  return $self->render(json => (await $self->service('shortname')->find_p($name)));
}

async sub get_item_by_name($self) {
  my ($name, $page) = $self->i(name => 'sname', page => 'num|undef');

  my $info = await $self->service('shortname')->find_p($name);
  return $self->msg('Not Found', 404) unless $info;

  my %data;

  try {
    if (my $post_id = $info->{post_id}) {
      $data{type}    = 'post';
      $data{content} = await $self->service('post')->read_p($post_id);
    }
    elsif (my $c_id = $info->{category_id}) {
      $data{type}    = 'category';
      $data{content} = await $self->service('category')->load_p($c_id, $page);
    }
    else {
      die "Invalid shortname $name";
    }
  }
  catch ($e) {

    if ($e =~ /no right/) {
      return $self->msg('Not Found', 404);
    }
    else {
      die $e;
    }

  }

  return $self->render(json => \%data);
}


1
