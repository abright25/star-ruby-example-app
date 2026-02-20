#!/bin/bash
set -e

# Wait for postgres
echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - continuing"

# Setup database
if ! bundle exec rake db:migrate:status >/dev/null 2>&1; then
  echo "Setting up database..."
  bundle exec rake db:create
  bundle exec rake db:migrate
  bundle exec rake db:seed
else
  echo "Database already exists, running migrations..."
  bundle exec rake db:migrate
fi

# Execute the main command
exec "$@"
