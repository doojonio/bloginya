package Bloginya::Schema::Post;
use Bloginya::Plugin::CoolIO::SchemaList;

schema tag => sub { defined($_[0]) && (2 <= length($_[0]) <= 16) };

schema title => sub { defined($_[0]) && (3 <= length($_[0]) <= 200) };

schema UpdateDraftPayload => {id => 'cool_id|undef', tags => ['tag'], title => 'title|undef'};

1;
