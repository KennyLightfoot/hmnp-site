# Fix: "prepared statement already exists" Error

## The Problem
Prisma is encountering a prepared statement conflict, usually due to connection pooling or stale connections.

## Solution 1: Use Unpooled Connection for Migrations

The pooled connection (port 6543) can cause issues with migrations. Use the unpooled connection instead.

### Update .env.local:

```bash
echo 'DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require"' > .env.local
```

Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### Then try again:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

## Solution 2: Reset Prisma Connection

If that doesn't work, try resetting Prisma:

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
rm -rf .prisma

# Regenerate client
pnpm dotenv -e .env.local -- pnpm prisma generate

# Try migrate status again
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

## Solution 3: Add Connection Parameters

Add connection parameters to prevent prepared statement reuse:

Update `.env.local` with:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1"
```

The `connection_limit=1` prevents connection pooling issues during migrations.

## Solution 4: Direct Migration (Skip Status Check)

If you just need to run the migration, you can skip the status check:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models
```

This will create and apply the migration directly.

