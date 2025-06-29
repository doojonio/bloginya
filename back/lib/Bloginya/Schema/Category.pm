package Bloginya::Schema::Category;
use Bloginya::Plugin::CoolIO::SchemaList;

use List::Util qw(any);

schema CategorySavePayload =>
  {title => 'str[1,120]', parent_id => 'cool_id|undef', description => 'str[0,500]|undef', priority => 'num|undef',};

schema 'cat_sort' => sub {
  any { $_ eq $_[0] } qw(published_at !published_at !popularity);
};

1;
