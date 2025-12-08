package Bloginya::Schema::Drive;
use Bloginya::Plugin::CoolIO::SchemaList;

use Bloginya::Model::Upload qw(SIZES);
use List::Util              qw(any);

schema 'dimension' => sub {
  return 1 unless defined $_[0];  # Allow undefined
  return 1 if $_[0] eq 'original';  # Allow 'original' as special dimension
  any { $_ eq $_[0] } keys(SIZES->%*);
};

schema 'path' => sub {
  $_[0] !~ /\.\./;
};

schema RegisterAudioPayload => {
  upload_id => 'str',
};

1;
