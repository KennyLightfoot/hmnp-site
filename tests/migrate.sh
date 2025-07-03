#!/bin/sh
# Migration Script for Test Database
# Houston Mobile Notary Pros

set -e

echo "🗃️ Starting test database migration..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! pg_isready -h postgres-test -p 5432 -U hmnp_test; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ Database is ready"

# Run Prisma migrations
echo "🚀 Running Prisma migrations..."
pnpm prisma migrate deploy

echo "📊 Generating Prisma client..."
pnpm prisma generate

# Seed basic test data
echo "🌱 Seeding basic test data..."
pnpm prisma db seed

echo "✅ Test database migration completed successfully!"

# Keep container running for debugging if needed
if [ "$KEEP_RUNNING" = "true" ]; then
  echo "🔄 Keeping container running for debugging..."
  tail -f /dev/null
fi