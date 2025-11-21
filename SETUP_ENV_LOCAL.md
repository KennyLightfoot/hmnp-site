# Setting Up .env.local File

## Quick Setup Guide

### Step 1: Create the .env.local file

Run this command in your terminal (from the project root):

```bash
echo 'DATABASE_URL="postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"' > .env.local
```

### Step 2: Verify it was created

Check that the file exists and has the correct content:

```bash
cat .env.local
```

You should see:
```
DATABASE_URL="postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 3: Test Prisma can see it

Verify Prisma can read the environment variable:

```bash
pnpm prisma migrate status
```

If it works, you'll see migration status. If it still says "Environment variable not found", make sure you're in the project root directory.

## Alternative: Manual Creation

If the echo command doesn't work, you can create the file manually:

1. **Create the file:**
   ```bash
   touch .env.local
   ```

2. **Open it in your editor:**
   ```bash
   nano .env.local
   # or
   code .env.local
   # or
   vim .env.local
   ```

3. **Add this line:**
   ```
   DATABASE_URL="postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```

4. **Save and close** (Ctrl+X then Y then Enter for nano, :wq for vim)

## Verify Everything Works

After creating `.env.local`, test that everything is set up correctly:

```bash
# Check Prisma can connect
pnpm prisma migrate status

# If that works, you're ready to run the migration!
pnpm prisma migrate dev --name add_notary_network_models
```

## Important Notes

- `.env.local` is in `.gitignore` - it won't be committed to git (this is correct!)
- Make sure you're in the project root directory (`/Ubuntu/home/kenkarot/dev/hmnp`)
- The file should be named exactly `.env.local` (with the dot at the beginning)

