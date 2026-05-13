#!/bin/sh
set -e

echo "Deleting hypnotooad.pid":
cat /app/script/hypnotoad.pid || echo "not found"
rm -f /app/script/hypnotoad.pid
echo "done"

if [ $# -eq 0 ]; then
    exec carmel exec hypnotoad -f script/bloginya
else
    exec carmel exec "$@"
fi
