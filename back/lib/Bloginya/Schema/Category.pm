package Bloginya::Schema::Category;
use Bloginya::Plugin::CoolIO::SchemaList;

schema CategorySavePayload =>
  {title => 'str[1,120]', parent_id => 'cool_id|undef', description => 'str[0,500]|undef', priority => 'num|undef',};

1;
