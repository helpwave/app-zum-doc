#!/bin/sh
set -eu
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
until psql "$DATABASE_URL" -c "SELECT id FROM substances LIMIT 0" >/dev/null 2>&1; do
  echo "waiting for products table"
  sleep 1
done
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /seed.sql
