#!/usr/bin/env bash
#
# Usage (from the repo root):
#   bash bin/seed.sh local   (default)
#   bash bin/seed.sh rds

set -e

TARGET="${1:-local}"

if [ "$TARGET" == "local" ]; then
    export DATABASE_URL="postgresql+asyncpg://postgres:password@127.0.0.1:5432/cashcow_dev"
    PSQL_HOST="127.0.0.1"
    PSQL_DB="cashcow_dev"
elif [ "$TARGET" == "rds" ]; then
    export DATABASE_URL="postgresql+asyncpg://postgres:password@cashcow-db.cdq8m40io7s6.us-east-2.rds.amazonaws.com:5432/cashcow-db"
    PSQL_HOST="cashcow-db.cdq8m40io7s6.us-east-2.rds.amazonaws.com"
    PSQL_DB="cashcow-db"
else
    echo "Usage: bin/seed.sh [local|rds]"
    exit 1
fi

echo "Seeding target: $TARGET"

cd backend

python -m scripts.create_tables

psql -h "$PSQL_HOST" -U postgres -d "$PSQL_DB" -f db/seed.sql

echo "Seed complete for $TARGET"
