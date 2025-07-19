package Bloginya::Schema::User;
use Bloginya::Plugin::CoolIO::SchemaList;

schema 'UpdateUserSettingsPayload' => {username => 'str[3,20]',};

1;
