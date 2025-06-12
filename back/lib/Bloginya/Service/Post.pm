package Bloginya::Service::Post;
use Mojo::Base -base, -signatures, -async_await;

use Bloginya::Model::Post qw(POST_STATUS_PUB);
use Time::Piece           ();

has 'db';
has 'redis';
has 'user';

async sub create_draft_p($self) {
  my $t = Time::Piece->new;
  $t = join ' ', ($t->mday, $t->monname);

  my $user_id = $self->user->{id};

  my $res = await $self->db->insert_p(
    'posts',
    {user_id   => $user_id, document => {-json => {type => 'doc', content => []}}, title => "Draft $t"},
    {returning => 'id'},
  );

  return $res->hashes->first->{id};
}

async sub list_new_posts_p($self, $limit = 8) {
  my $res = await $self->db->select_p(
    ['posts',    ['shortnames', 'posts.id' => 'shortnames.post_id']],
    ['posts.id', 'posts.picture', 'posts.title', 'posts.created_at', 'shortnames.name'],
    {'status' => POST_STATUS_PUB},
    {order_by => [{-desc => 'posts.created_at'}], limit => $limit}
  );

  return $res->hashes;
}

async sub list_posts_by_category_p($self, $category_id, $limit = 5) {
  my @p_fields = ('p.id', 'shortnames.name', 'p.picture', 'p.category_id', 'p.title', 'p.description',);
  my $res      = await $self->db->select_p(
    [
      \'posts p',
      ['shortnames', 'p.id'             => 'shortnames.post_id'],
      ['post_tags',  'p.id'             => 'post_tags.post_id'],
      ['tags',       'post_tags.tag_id' => 'tags.id']
    ],
    [@p_fields, [\'array_agg(tags.name)' => 'tags'],],
    {'p.category_id' => $category_id, 'status' => POST_STATUS_PUB},
    {group_by        => \@p_fields,   order_by => {-desc => 'p.created_at'}}
  );

  my %posts_by_category;
  for my $row ($res->hashes->@*) {
    $posts_by_category{$row->{category_id}} = $row;
  }

  return \%posts_by_category;
}

async sub list_popular_posts_p($self, $limit = 18, $offset = 0) {
  my $res = await $self->db->select_p(
    [
      'posts',
      ['shortnames', 'posts.id' => 'shortnames.post_id'],
      ['post_stats', 'posts.id' => 'post_stats.post_id'],
      ['comments',   'posts.id' => 'comments.post_id'],
      ['post_likes', 'posts.id' => 'post_likes.post_id']
    ],
    [
      'posts.id',
      'posts.picture',
      'shortnames.name',
      [
        \'(post_stats.short_views + post_stats.medium_views + post_stats.long_views + count(comments.id) + count(post_likes.*))'
          => 'popularity'
      ]
    ],
    {'status' => POST_STATUS_PUB},
    {
      group_by => [
        'posts.id', 'shortnames.name', 'posts.picture', 'post_stats.short_views',
        'post_stats.medium_views', 'post_stats.long_views'
      ],
      order_by => [{-desc => 'popularity'}]
    },

    {limit => $limit, offset => $offset}
  );

  return $res->hashes;
}


1;
