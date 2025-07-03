package Bloginya::Service::Category;
use Mojo::Base -base, -signatures, -async_await;

use List::Util qw(any);

use Bloginya::Model::Upload qw(medium_variant);
use Bloginya::Model::Post   qw(POST_STATUS_PUB);

has 'db';
has 'redis';
has 'current_user';
has 'se_tags';
has 'se_shortname';

async sub create_p ($self, $vals) {
  my %fields = map { $_ => $vals->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw (title parent_id description priority)
  } keys %$vals;

  $fields{user_id} = $self->current_user->{id};

  my $tx = $self->db->begin;
  my $id = (await $self->db->insert_p('categories', \%fields, {returning => ['id']}))->hashes->first->{id};

  await $self->se_tags->apply_tags_cat_p($id, $vals->{tags});
  await $self->se_shortname->set_shortname_for_category($id, $vals->{shortname});

  $tx->commit;

  return $id;
}

async sub update_p ($self, $id, $vals) {
  my %fields = map { $_ => $vals->{$_} } grep {
    my $a = $_;
    any { $_ eq $a } qw (title parent_id description priority)
  } keys %$vals;

  my $tx = $self->db->begin;
  await $self->db->update_p('categories', \%fields, {id => $id}, {returning => ['id']});
  await $self->se_tags->apply_tags_cat_p($id, $vals->{tags});
  await $self->se_shortname->set_shortname_for_category($id, $vals->{shortname});

  $tx->commit;

  return $id;
}

async sub get_for_edit_p ($self, $id) {
  my $cat = (await $self->db->select_p(
    [\'categories c', [-left => \'shortnames csn', 'csn.category_id' => 'c.id']],
    [
      'c.id', 'c.title', 'c.description', ['csn.name' => 'shortname'], \'(
        select
          coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from category_tags ct join tags t on t.id = ct.tag_id
        where ct.category_id = c.id
      ) as tags'
    ],
    {id => $id},
  ))->hashes->first;

  return $cat;
}

async sub get_by_title_p($self, $title) {
  (await $self->db->select_p('categories', [qw(title id priority description)], {title => $title}))->hashes->first;
}

async sub list_all_categories_p($self) {
  return (await $self->db->select_p('categories', [qw(id title)]))->hashes;
}

async sub list_site_categories_by_tag_p($self, $tag) {
  my $res = await $self->db->select_p(
    [\'categories c', [-left => \'shortnames sn', 'c.id' => 'sn.category_id']],
    ['c.id', 'c.title', 'sn.name'],
    {
      parent_id => undef,
      'c.id'    => {
        -in => \['(select category_id from category_tags ct join tags t on t.id = ct.tag_id where t.name = (?))', $tag]
      }
    },
    {order_by => [\'priority asc nulls last', {-desc => 'created_at'}]}

  );

  return $res->hashes;
}

sub _map_cat_sort($self, $sort) {
  my $desc = 0;
  if (substr($sort, 0, 1) eq '!') {
    $desc = 1;
  }

  return $desc ? {-desc => substr($sort, 1)} : $sort;
}

async sub load_p($self, $id, $page = 0, $sort = '!published_at') {
  use constant GRID_COUNT => 18;
  use constant LIST_COUNT => 5;
  use constant PER_PAGE   => GRID_COUNT + LIST_COUNT;

  my @add_select;

  my $cat = (await $self->db->select_p(
    [\'categories c', [-left => \'shortnames csn', 'csn.category_id' => 'c.id']],
    [
      qw(
        title
        id
        csn.name
      ),
      \[
        '(select count(*) from posts where category_id = c.id and status = (?)) as category_posts_num',
        POST_STATUS_PUB
      ],
    ],
    {id => $id}
  ))->hashes->first;

  die 'not found' unless $cat;

  if ($sort =~ /popularity/) {
    push @add_select, [
      \q~
        (
        select
          coalesce((select count(*) from comments com where com.post_id = p.id), 0) * 4
          +
          coalesce((select count(*) from post_likes lik where lik.post_id = p.id), 0) * 2
          +
          coalesce((select (short_views * 0.5 + medium_views + long_views * 2) from post_stats ps where ps.post_id = p.id), 0)
        )
      ~ => 'popularity'
    ];
  }


  my $res = await $self->db->select_p(
    [
      \'posts p',
      [-left => \'shortnames psn', 'p.id'          => 'psn.post_id'],
      [-left => \'uploads upre',   'p.picture_pre' => 'upre.id'],
    ],
    [
      [medium_variant('upre'), 'picture_pre'], 'p.title', 'psn.name', 'p.id', 'p.description', \'(
        select
          coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
        from post_tags pt join tags t on t.id = pt.tag_id
        where pt.post_id = p.id
      ) as tags', @add_select,
    ],
    {'p.category_id' => $id, 'p.status' => POST_STATUS_PUB},
    {order_by => $self->_map_cat_sort($sort), limit => PER_PAGE, offset => PER_PAGE * ($page // 0)}
  );

  my (@grid_posts, @list_posts);
  for my $row ($res->hashes->@*) {
    if (@grid_posts < GRID_COUNT) {

      # TODO FIX x3
      push @grid_posts,
        {picture_pre => $row->{picture_pre}, title => $row->{title}, name => $row->{name}, id => $row->{id}};
    }
    else {
      push @list_posts,
        {
        id          => $row->{id},
        name        => $row->{name},
        title       => $row->{title},
        picture_pre => $row->{picture_pre},
        description => $row->{description},
        tags        => $row->{tags},
        };
    }
  }

  @{$cat}{qw(grid_posts list_posts page sort)} = (\@grid_posts, \@list_posts, $page, $sort);

  $cat;
}


1;
