package Bloginya::Service::Search;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::User qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Iterator::Simple      qw(:all);
use List::Util            qw(none any);
use Time::Piece           ();

use constant _Query => __PACKAGE__ . '::_Query';

has 'db';
has 'redis';
has 'log';
has 'current_user';

async sub search_p ($self, $query) {
  $query = _Query->new(q => $query, log => $self->log, current_user => $self->current_user);

  my ($stmt, @binds) = $query->stmt;

  $self->log->trace('search: ' . $stmt);

  my $res = await $self->db->query_p($stmt, @binds);

  return $res->hashes;
}

package Bloginya::Service::Search::_Query {
  use Mojo::Base -base;

  use SQL::Abstract::Pg     ();
  use Bloginya::Model::Post qw(POST_STATUS_PUB);
  use Bloginya::Model::User qw(USER_ROLE_OWNER);

  has 'q';
  has 'log';
  has 'current_user';

  has stmt_posts => sub {
    +{
      from => [
        \'posts p',
        [-left => \'shortnames psn', 'p.id'          => 'psn.post_id'],
        [-left => \'categories c',   'p.category_id' => 'c.id'],
        [-left => \'post_fts pf',    'p.id'          => 'pf.post_id'],
        [-left => \'languages l',    'pf.lcode'      => 'l.code'],
      ],
      fields => [
        'p.id',
        'psn.name',
        'p.title',
        ['c.title' => 'description'],
        'p.picture_pre',
        \"(select 'post') as type",
        \['
        round(
          similarity(
            pf.plain_content,
            (?)
          )::numeric,
          1
        ) as similarity
        ', $_[0]->q
        ]
      ],
      where => {'p.status' => POST_STATUS_PUB, -and => []},
      opts  => {},
    };
  };
  has stmt_cats => sub {
    +{
      from   => [\'categories c', [-left => \'shortnames csn', 'c.id' => 'csn.category_id']],
      fields => [
        'c.id',
        'csn.name',
        'c.title',
        'c.description',
        \'(select null) as picture_pre',
        \"(select 'category') as type",
        \['
        round(
          similarity(
            c.title,
            (?)
          )::numeric,
          1
        ) as similarity
        ', $_[0]->q
        ]
      ],
      where => {'c.status' => 'pub', -and => []},
      opts  => {},

    };
  };

  # anon arrays break syntax hihglight
  has words => sub { my @words = $_[0]->q =~ /(?<![#\w])(\w+)/g;  \@words };
  has tags  => sub { my @tags  = $_[0]->q =~ /(?<!\w)#(\w{2,})/g; \@tags };

  has abstract => sub { SQL::Abstract::Pg->new(array_datatypes => 1, name_sep => '.', quote_char => '"') };

  sub stmt ($self) {
    $self->fill_filters;

    my $p = $self->stmt_posts;
    my $c = $self->stmt_cats;
    my ($posts_stmt, @posts_binds) = $self->abstract->select(@{$p}{qw(from fields where opts)});
    my ($cat_stmt, @cat_binds)     = $self->abstract->select(@{$c}{qw(from fields where opts)});

    return qq{
    $posts_stmt
    union all
    $cat_stmt
    order by similarity
    limit 10
    }, @posts_binds, @cat_binds;
  }

  sub fill_filters ($self) {
    for (qw(
      status
      words
      tags
    ))
    {
      my $method = "_filter_$_";
      $self->$method();
    }
  }

  sub _filter_status ($self) {

    my $current_user = $self->current_user;
    if ($current_user->{role} eq USER_ROLE_OWNER) {
      delete $self->stmt_posts->{where}{'p.status'};
      delete $self->stmt_cats->{where}{'c.status'};
    }

  }

  sub _filter_words ($self) {
    my $words = $self->words;

    return unless @$words;

    my sub _tsq ($word) {
      return qq~$word:*~;
    }

    my $search_str = join ' | ', map { _tsq($_) } @$words;

    push $self->stmt_posts->{where}{-and}->@*, \['pf.fts @@ to_tsquery( l.fts_cfg, (?))', $search_str];
    push $self->stmt_cats->{where}{-and}->@*,
      \["to_tsvector('simple', c.title) @@ to_tsquery( 'simple', (?))", $search_str];
  }

  sub _filter_tags($self) {
    my $tags = $self->tags;
    if (!@$tags) {
      return;
    }

    local $" = ", ";
    $self->log->trace("Filtering by tags: @$tags");

    my @ph = map {'(?)'} @$tags;

    push $self->stmt_posts->{where}{-and}->@*, \[
      "(
        select coalesce(array_remove(array_agg(pt.tag_id), NULL), ARRAY[]::integer[])
        from post_tags pt
        where pt.post_id = p.id
      ) @> (select coalesce(array_agg(t.id), ARRAY[null]::integer[]) from tags t where t.name in (@ph))
      ", @$tags,
    ];

    push $self->stmt_cats->{where}{-and}->@*, \[
      "(
        select coalesce(array_remove(array_agg(ct.tag_id), NULL), ARRAY[]::integer[])
        from category_tags ct
        where ct.category_id = c.id
      ) @> (select coalesce(array_agg(t.id), ARRAY[null]::integer[]) from tags t where t.name in (@ph))
      ", @$tags,
    ];
  }

}


1;
