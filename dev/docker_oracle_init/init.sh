#!/bin/bash

set -euxo pipefail

echo "Starting to run scripts..."
sqlplus -s supersedure/example@//localhost/SAKILA @"/docker-entrypoint-initdb.d/scripts/1.sql"
sqlplus -s supersedure/example@//localhost/SAKILA @"/docker-entrypoint-initdb.d/scripts/2.sql"
sqlplus -s supersedure/example@//localhost/SAKILA @"/docker-entrypoint-initdb.d/scripts/3.sql"
echo "Finished running scripts"
