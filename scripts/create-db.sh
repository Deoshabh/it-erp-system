#!/usr/bin/env bash
set -e
: "${PGHOST:?need PGHOST}" "${PGUSER:?need PGUSER}" "${PGPASSWORD:?need PGPASSWORD}" "${PGPORT:=5432}"

export PGPASSWORD="$PGPASSWORD"
psql -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -tc "SELECT 1 FROM pg_database WHERE datname = 'it_erp'" | grep -q 1 || \
  psql -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -c "CREATE DATABASE it_erp;"
echo "Database it_erp exists or was created."
