package Bloginya::Schema::Comment;
use Bloginya::Plugin::CoolIO::SchemaList;

schema AddCommentPayload => {
  post_id => 'cool_id',
  reply_to_id => 'cool_id|undef',
  content => 'str[0,500]',
  upload_id => 'str|undef',
};


1;
