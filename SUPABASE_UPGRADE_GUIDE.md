# Supabase PostgreSQL Upgrade Guide

## Project Information
- **Project ID**: `unnyhvuhobnmxnpffore`
- **Current Version**: Postgres 17.4.1.043
- **Status**: Security patches available - upgrade recommended

## Pre-Upgrade Checklist

### ✅ Step 1: Verify Connection String

Your connection string should match your project ID. Update `.env.local` if needed:

**Pooled Connection (for production):**
```
DATABASE_URL="postgresql://postgres.unnyhvuhobnmxnpffore:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

**Unpooled Connection (for migrations/backups):**
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require"
```

### ✅ Step 2: Create Database Backup

Run the backup script before upgrading:

```bash
# Make sure you have DATABASE_URL in .env.local
pnpm dotenv -e .env.local -- bash scripts/backup-database.sh
```

Or manually:

```bash
# Using pg_dump (if you have PostgreSQL client installed)
pg_dump "postgresql://postgres:[PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require" > backup-$(date +%Y%m%d-%H%M%S).sql

# Or use Supabase dashboard backup feature
# Go to: Settings → Database → Backups → Create Backup
```

### ✅ Step 3: Document Current State

Check your current database extensions and configurations:

```bash
pnpm dotenv -e .env.local -- pnpm tsx scripts/check-database-state.ts
```

### ✅ Step 4: Schedule Maintenance Window

- **Recommended time**: Low-traffic period
- **Estimated downtime**: 5-15 minutes (Supabase handles this)
- **Notify stakeholders**: Inform users of potential brief interruption

## Upgrade Process

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/unnyhvuhobnmxnpffore
   - Go to **Settings** → **Database**

2. **Initiate Upgrade**
   - Look for "Upgrade PostgreSQL" or "Database Version" section
   - Click "Upgrade" or "Update to latest patch"
   - Follow Supabase's guided upgrade process

3. **Monitor Progress**
   - Watch the upgrade status in the dashboard
   - Upgrade typically takes 5-15 minutes

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref unnyhvuhobnmxnpffore

# Check current version
supabase db version

# Upgrade (if CLI supports it)
# Note: Check Supabase CLI docs for exact command
```

## Post-Upgrade Validation

### Step 1: Verify Database Connection

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

### Step 2: Check PostgreSQL Version

```bash
pnpm dotenv -e .env.local -- pnpm tsx scripts/verify-postgres-version.ts
```

### Step 3: Run Application Smoke Tests

```bash
# Test critical database operations
pnpm dotenv -e .env.local -- pnpm tsx scripts/test-database-operations.ts

# Test Prisma queries
pnpm dotenv -e .env.local -- pnpm prisma studio
# Then manually test a few queries
```

### Step 4: Monitor Application Logs

- Check Vercel deployment logs
- Monitor error rates
- Watch for any deprecation warnings

### Step 5: Run Integration Tests

```bash
# Run your test suite
pnpm test:integration

# Or run specific database tests
pnpm test -- tests/database
```

## Rollback Plan

If issues occur after upgrade:

### Option 1: Restore from Backup

```bash
# Restore backup using psql
psql "postgresql://postgres:[PASSWORD]@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require" < backup-YYYYMMDD-HHMMSS.sql
```

### Option 2: Contact Supabase Support

- Supabase may be able to rollback the upgrade
- Contact via dashboard or support@supabase.com
- Provide backup timestamp and issue details

### Option 3: Use Point-in-Time Recovery

- Supabase offers point-in-time recovery
- Go to Settings → Database → Backups
- Restore to a point before the upgrade

## Post-Upgrade Monitoring (24-72 hours)

Monitor these metrics:

- **Error rates**: Check for increased database errors
- **Query performance**: Watch for slow queries
- **Connection issues**: Monitor connection pool health
- **Application logs**: Look for deprecation warnings

## Troubleshooting

### Issue: Connection errors after upgrade

**Solution**: Verify connection string matches new project configuration

### Issue: Extension compatibility issues

**Solution**: Check extension versions and update if needed

### Issue: Performance degradation

**Solution**: 
- Check query plans
- Review connection pool settings
- Contact Supabase support

## Next Steps After Successful Upgrade

1. ✅ Document the upgrade completion
2. ✅ Update team on successful upgrade
3. ✅ Schedule next upgrade review
4. ✅ Update backup procedures if needed

