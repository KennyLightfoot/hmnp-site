# Environment Setup for Migration

## Quick Fix: Create `.env.local` file

The migration command needs the `DATABASE_URL` environment variable. Create a `.env.local` file in the root directory with your database connection string.

### Option 1: Using Supabase (Production Database)

If you're using the Supabase database, add this to `.env.local`:

```bash
DATABASE_URL="postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Option 2: Using Local PostgreSQL

If you have a local PostgreSQL database:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?sslmode=prefer"
```

### Option 3: Using Neon or Other Cloud Database

Use your specific connection string from your database provider.

## Steps to Create `.env.local`

1. **Create the file** in the project root:
   ```bash
   touch .env.local
   ```

2. **Add DATABASE_URL** to the file:
   ```bash
   echo 'DATABASE_URL="your_connection_string_here"' >> .env.local
   ```

3. **Verify the file exists**:
   ```bash
   ls -la .env.local
   ```

4. **Run the migration again**:
   ```bash
   pnpm prisma migrate dev --name add_notary_network_models
   ```

## Important Notes

- `.env.local` is in `.gitignore` and won't be committed to git
- Make sure your DATABASE_URL is correct for your environment
- If you're unsure which database to use, check with your team or use the Supabase connection string from `sync-env-to-vercel.sh`

## After Setting Up `.env.local`

Once you have the file created, you can run:

```bash
# Run migration
pnpm prisma migrate dev --name add_notary_network_models

# Generate Prisma client
pnpm prisma generate
```

