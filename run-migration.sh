#!/bin/bash
# Run the Prisma migration for Notary Network models

echo "🔧 Running Prisma migration for Notary Network models..."
pnpm prisma migrate dev --name add_notary_network_models

echo "📦 Generating Prisma Client..."
pnpm prisma generate

echo "✅ Migration complete!"

