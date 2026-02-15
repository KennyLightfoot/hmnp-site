# Fix: Migration Stuck or Taking Too Long

## The Problem
Migrations can get stuck when using pooled connections (port 6543). The pooled connection is optimized for app queries, not schema changes.

## Solution 1: Use Unpooled Connection for Migration

### Get Unpooled Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/unnyhvuhobnmxnpffore
2. Navigate to **Settings** → **Database**
3. Find **Connection string** section
4. Look for **Direct connection** or **Connection pooling: Direct**
5. Copy the URI (should use port 5432, not 6543)

### Update .env.local with Unpooled Connection

```bash
# Replace with your actual unpooled connection string from Supabase
echo 'DATABASE_URL="postgresql://postgres:[PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require"' > .env.local
```

### Try Migration Again

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models
```

## Solution 2: Use Prisma DB Push (Alternative)

If migration still doesn't work, you can use `db push` which syncs schema directly:

```bash
pnpm dotenv -e .env.local -- pnpm prisma db push
```

**Note**: `db push` doesn't create migration files, but it will update your database schema. You'll need to create migration files manually afterward if you want them for version control.

## Solution 3: Check for Database Locks

The migration might be waiting for a lock. Check Supabase dashboard:

1. Go to **Database** → **Reports** or **Logs**
2. Look for any long-running queries
3. Check if there are any locks on tables

## Solution 4: Create Migration Manually

If all else fails, you can create the migration file manually and apply it:

```bash
# Create migration directory
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_notary_network_models

# Then use migrate deploy instead of migrate dev
pnpm dotenv -e .env.local -- pnpm prisma migrate deploy
```

## About the Node Version Warnings

The warnings about Node version (wanted >=20 <21, you have v24.11.1) are **not critical** but could potentially cause issues. However, they shouldn't prevent migrations from working.

If you want to fix them:
- Use Node 20.x (LTS) instead of 24.x
- Or ignore them for now (they're just warnings)

## Recommended Next Steps

1. **First**: Get unpooled connection string from Supabase dashboard
2. **Update** `.env.local` with unpooled connection (port 5432)
3. **Try** migration again with unpooled connection
4. **If still stuck**: Use `prisma db push` as alternative

