# Setting Up DATABASE_URL Correctly

## The Issue
Prisma requires `DATABASE_URL` (not `SUPABASE_POSTGRES_URL`), and you need to replace the password placeholder.

## Solution

### Step 1: Get Your Actual Password

You mentioned you have the password in your connection string. Extract it and use it in `DATABASE_URL`.

### Step 2: Update .env.local

Replace `[YOUR-ACTUAL-PASSWORD]` with your real password:

```bash
echo 'DATABASE_URL="postgresql://postgres.unnyhvuhobnmxnpffore:[YOUR-ACTUAL-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"' > .env.local
```

**Important**: 
- Use `DATABASE_URL` (not `SUPABASE_POSTGRES_URL`)
- Replace `[YOUR-ACTUAL-PASSWORD]` with your actual password
- Keep the `postgresql://` protocol (not `postgres://`)

### Step 3: Verify It's Set

```bash
cat .env.local
```

You should see:
```
DATABASE_URL="postgresql://postgres.unnyhvuhobnmxnpffore:YOUR-PASSWORD-HERE@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### Step 4: Test Connection

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

## Alternative: Get Fresh Connection String from Supabase

If you're not sure about the password:

1. Go to: https://supabase.com/dashboard/project/unnyhvuhobnmxnpffore
2. Navigate to **Settings** → **Database**
3. Find **Connection string** section
4. Copy the **URI** format (it will have your password)
5. Update `.env.local`:

```bash
# Copy the entire connection string from Supabase dashboard
echo 'DATABASE_URL="[PASTE-FULL-CONNECTION-STRING-HERE]"' > .env.local
```

## Format Notes

- ✅ Correct: `DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"`
- ❌ Wrong: `SUPABASE_POSTGRES_URL=...` (Prisma doesn't read this)
- ❌ Wrong: `postgres://` (should be `postgresql://`)

