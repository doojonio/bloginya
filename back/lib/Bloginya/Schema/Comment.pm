package Bloginya::Schema::Comment;
use Bloginya::Plugin::CoolIO::SchemaList;

schema AddCommentPayload => {post_id => 'cool_id', reply_to_id => 'cool_id|undef', content => 'str[3,500]',};


1;
