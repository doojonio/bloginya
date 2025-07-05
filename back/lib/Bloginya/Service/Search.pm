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
has 'current_user';
has 'se_tags';
has 'se_shortname';
has 'se_policy';
has 'se_prose_mirror';
has 'se_drive';
has 'se_language';

async sub search ($self, $query) {
  $query = _Query->new($query);
}

package Bloginya::Service::_Query {

  sub new ($class, $q) {
    die 'invalid length' if length($q) < 3;
    bless($class, {_q => $q});
  }

  sub q { $_[0]->{_q} }

  sub _fitler_tags($self) {
    my @tags = $self->q =~ m{\b\#(\w{2,})\b};
    if (!@tags) {
      return undef;
    }
  }

}


1;
