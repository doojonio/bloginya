package Bloginya::Service::Search;
use Mojo::Base -base, -signatures, -async_await;

use experimental 'try';

use Bloginya::Model::Post        qw(POST_STATUS_PUB POST_STATUS_DEL POST_STATUS_DRAFT);
use Bloginya::Model::ProseMirror qw(is_image is_text);
use Bloginya::Model::User        qw(USER_ROLE_OWNER USER_ROLE_CREATOR);
use Iterator::Simple             qw(:all);
use List::Util                   qw(none any);
use Time::Piece                  ();

use constant _Query => __PACKAGE__ . '::_Query';

has 'db';
has 'redis';
has 'log';

async sub search_p ($self, $query) {
  $query = _Query->new($query, $self->log);

  my ($stmt, @binds) = $query->stmt;

  use DDP;
  p $stmt;
  p @binds;

  my $res = await $self->db->query_p($stmt, @binds);

  return $res->hashes;
}

package Bloginya::Service::Search::_Query {
  use Mojo::Base -base;

  use SQL::Abstract::Pg ();

  has 'q';
  has 'log';

  has stmt_posts => sub {
    +{
      from => [
        \'posts p',
        [-left => \'shortnames psn', 'p.id'          => 'psn.post_id'],
        [-left => \'categories c',   'p.category_id' => 'c.id'],
      ],
      fields =>
        ['p.id', 'psn.name', 'p.title', ['c.title' => 'description'], 'p.picture_pre', \"(select 'post') as type"],
      where => {},
      opts  => {},
    };
  };
  has stmt_cats => sub {
    +{
      from   => [\'categories c', [-left => \'shortnames csn', 'c.id' => 'csn.category_id']],
      fields => [
        'c.id', 'csn.name', 'c.title', 'c.description',
        \'(select null) as picture_pre',
        \"(select 'category') as type"
      ],
      where => {},
      opts  => {},

    };
  };

  has abstract => sub { SQL::Abstract::Pg->new(array_datatypes => 1, name_sep => '.', quote_char => '"') };

  sub new ($class, $q, $log) {
    die 'invalid length' if length($q) < 3;
    $class->SUPER::new(q => $q, log => $log);
  }

  sub stmt ($self) {
    $self->fill_filters;

    my $p = $self->stmt_posts;
    my $c = $self->stmt_cats;
    use DDP;
    p $p;
    p $c;
    my ($posts_stmt, @posts_binds) = $self->abstract->select(@{$p}{qw(from fields where opts)});
    my ($cat_stmt,   @cat_binds)   = $self->abstract->select(@{$c}{qw(from fields where opts)});

    return qq{
    $posts_stmt
    union all
    $cat_stmt
    }, @posts_binds, @cat_binds;
  }

  sub fill_filters ($self) {
    for (qw(
      tags
    ))
    {
      my $method = "_filter_$_";
      $self->$method();
    }
  }

  sub _filter_tags($self) {
    my @tags = $self->q =~ /\W#(\w{2,})/g;
    if (!@tags) {
      return;
    }

    local $" = ", ";
    $self->log->trace("Filtering by tags: @tags");

    # $self->stmt_posts->{where}{
    #   \'(
    #     select coalesce(array_remove(array_agg(t.name), NULL), ARRAY[]::text[])
    #     from post_tags pt join tags t on t.id = pt.tag_id
    #     where pt.post_id = p.id
    #   )
    # )'
    # } = {'@>', \@tags};
  }

}


1;
