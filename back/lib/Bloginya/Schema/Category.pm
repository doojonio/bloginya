package Bloginya::Schema::Category;
use Bloginya::Plugin::CoolIO::SchemaList;

use List::Util qw(any);

schema CategorySavePayload => {
  title       => 'str[1,120]',
  shortname   => 'sname|undef',
  parent_id   => 'cool_id|undef',
  description => 'str[0,500]|undef',
  priority    => 'num|undef',
  status      => 'category_status',
  tags        => ['str[2,16]'],
};

schema 'cat_sort' => sub {
  any { $_ eq $_[0] } qw(published_at !published_at !popularity);
};

schema 'category_status' => sub {
  any { $_ eq $_[0] } qw(pub private);
};

1;
