package Bloginya::Service::Tags;
use Mojo::Base -base, -signatures, -async_await;

use SQL::Abstract::Pg;
use List::Util qw(uniq);

has 'db';
has 'redis';
has 'current_user';

has 'sql' => sub { SQL::Abstract::Pg->new };

async sub ensure_tags_p ($self, $tags) {
  my @b = map {'( (?) )'} @$tags;
  my $q = do {
    local $" = ",";
    qq~
    insert into tags(name) values @b
    on conflict do nothing
  ~;
  };

  await $self->db->query_p($q, @$tags);
}

sub normalize($self, $tag) {
  $tag =~ s/\W//gr;
}

async sub apply_tags_p($self, $post_id, $tags) {
  @$tags = uniq map { $self->normalize($_) } @$tags;

  await $self->ensure_tags_p($tags);

  my ($s, @binds) = $self->sql->select('tags', 'id', {name => {-in => $tags}});
  await $self->db->query_p(
    qq~insert into post_tags (post_id, tag_id)
      select p.post_id, t.id
      from (select (?) as post_id) p
          left outer join ($s) t on 1 = 1

      on conflict do nothing

      ~, $post_id, @binds
  );
}

1;
