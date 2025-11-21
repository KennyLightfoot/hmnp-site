# Quick Fix: DATABASE_URL Missing

## Problem
The migration command failed because `DATABASE_URL` environment variable is not found.

## Solution

Create a `.env.local` file in the project root with your database connection string.

### Step 1: Create `.env.local` file

Based on your sync scripts, you're using Supabase. Create `.env.local` with:

```bash
DATABASE_URL="postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 2: Run the migration

```bash
pnpm prisma migrate dev --name add_notary_network_models
```

### Step 3: Generate Prisma Client

```bash
pnpm prisma generate
```

## Alternative: Use dotenv-cli

If you prefer to load env vars from a different file or inline:

```bash
# Using dotenv-cli (if installed)
dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models
```

## Verify Setup

After creating `.env.local`, verify Prisma can see it:

```bash
pnpm prisma migrate status
```

This should show your migration status without errors.

