#!/bin/sh
# wait-for-postgres.sh
set -e

until PGPASSWORD=password psql -h "postgresql" -U "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

cd /app
# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

DISABLE_DATABASE_ENVIRONMENT_CHECK=1 ./bin/rails db:setup

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
