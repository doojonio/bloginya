package Bloginya::Model::UserActionLog;

use strict;
use warnings;

use Exporter qw(import);

use experimental 'signatures';

our @EXPORT_OK = qw(
  LOG_TYPE_SHORTVIEW
  LOG_TYPE_MEDIUMVIEW
  LOG_TYPE_LONGVIEW
);

use constant LOG_TYPE_SHORTVIEW  => 1;
use constant LOG_TYPE_MEDIUMVIEW => 2;
use constant LOG_TYPE_LONGVIEW   => 3;

1;
