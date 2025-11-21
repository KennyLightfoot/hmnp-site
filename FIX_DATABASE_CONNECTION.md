# Fix: "Tenant or user not found" Database Error

## The Problem
The pooled Supabase connection string format might be incorrect. Let's try the unpooled connection instead.

## Solution: Use Unpooled Connection String

The unpooled connection string uses a simpler format that's more reliable for migrations.

### Update your .env.local file:

Replace the current DATABASE_URL with this unpooled version:

```bash
echo 'DATABASE_URL="postgresql://postgres:Hmnp128174Supa@db.czxoxhokegnzfctgnhjo.supabase.co:5432/postgres?sslmode=require"' > .env.local
```

### Test the connection:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

## Alternative: Get Fresh Connection String from Supabase

If that doesn't work, you should get the connection string directly from your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find the **Connection string** section
4. Copy the **URI** format (not the pooled one)
5. Update `.env.local` with that string

## Connection String Formats

**Pooled (for production apps):**
```
postgresql://postgres.czxoxhokegnzfctgnhjo:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Unpooled (for migrations):**
```
postgresql://postgres:PASSWORD@db.czxoxhokegnzfctgnhjo.supabase.co:5432/postgres
```

The unpooled connection is better for migrations because:
- Simpler username format (`postgres` instead of `postgres.projectid`)
- Direct connection to the database
- More reliable for schema operations

