package Bloginya::Schema::Post;
use Bloginya::Plugin::CoolIO::SchemaList;

use List::Util qw(any);

use Bloginya::Model::Post qw(
  POST_STATUS_DRAFT
  POST_STATUS_PUB
  POST_STATUS_DEL
);

# schema tag => sub { defined($_[0]) && (2 <= length($_[0]) <= 16) };

# schema title => sub { defined($_[0]) && (3 <= length($_[0]) <= 200) };

schema post_status => sub {
  $_[0] && any { $_ eq $_[0] } (POST_STATUS_DRAFT, POST_STATUS_PUB, POST_STATUS_DEL);
};

schema sname => sub {
  defined($_[0]) && $_[0] =~ /\w{3,16}/;
};

schema UpdateDraftPayload => {
  title       => 'str[3,200]',
  document    => {type => 'str', content => 'arrayref'},
  picture_wp  => 'str|undef',
  picture_pre => 'str|undef'
};

schema ApplyChangesPayload => {
  tags            => ['str[2,16]'],
  status          => 'post_status',
  category_id     => 'cool_id|undef',
  shortname       => 'sname|undef',
  enable_likes    => 'bool',
  enable_comments => 'bool',
};

1;
