package Bloginya::Service::Tags;
use Mojo::Base -base, -signatures, -async_await;

use SQL::Abstract::Pg;
use List::Util qw(uniq);

has 'db';
has 'redis';
has 'current_user';
has 'log';

has 'sql' => sub { SQL::Abstract::Pg->new };

async sub ensure_tags_p ($self, $tags) {
  return unless @$tags;
  $self->log->trace('Ensuring tags exist: ' . join(', ', @$tags));

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
  my $normalized = $tag =~ s/\W//gr;
  if ($tag ne $normalized) {
    $self->log->trace(qq{Normalizing tag "$tag" to "$normalized"});
  }
  return $normalized;
}

async sub apply_tags_p($self, $post_id, $tags) {
  $self->log->debug(qq/Applying tags for post $post_id: / . (@$tags ? join ', ', @$tags : 'none'));
  await $self->db->delete_p('post_tags', {post_id => $post_id});
  return unless @$tags;

  @$tags = uniq map { $self->normalize($_) } @$tags;
  $self->log->trace("Normalized and unique tags for post $post_id: " . join(', ', @$tags));
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
  $self->log->info("Applied " . scalar(@$tags) . " tags to post $post_id");
}

async sub apply_tags_cat_p($self, $category_id, $tags) {
  $self->log->debug(qq/Applying tags for category $category_id: / . (@$tags ? join ', ', @$tags : 'none'));
  await $self->db->delete_p('category_tags', {category_id => $category_id});
  return unless @$tags;

  @$tags = uniq map { $self->normalize($_) } @$tags;
  $self->log->trace("Normalized and unique tags for category $category_id: " . join(', ', @$tags));

  await $self->ensure_tags_p($tags);

  my ($s, @binds) = $self->sql->select('tags', 'id', {name => {-in => $tags}});
  await $self->db->query_p(
    qq~insert into category_tags (category_id, tag_id)
      select c.category_id, t.id
      from (select (?) as category_id) c
          left outer join ($s) t on 1 = 1

      on conflict do nothing

      ~, $category_id, @binds
  );
  $self->log->info("Applied " . scalar(@$tags) . " tags to category $category_id");
}

1;
