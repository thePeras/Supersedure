#!/bin/bash

set -euxo pipefail

echo "Starting to run scripts..."
sqlplus -s supersedure/password@//localhost/SUPERSEDURE @"/docker-entrypoint-initdb.d/scripts/1.sql"

echo "Finished running scripts"
