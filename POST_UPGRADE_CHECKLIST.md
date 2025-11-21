# Post-Upgrade Checklist: Commit & Push Web App

## ✅ Step 1: Verify Supabase Upgrade

Verify the upgrade completed successfully:

```bash
pnpm dotenv -e .env.local -- pnpm tsx scripts/verify-postgres-version.ts
```

You should see a version newer than `17.4.1.043`.

## ✅ Step 2: Test Database Connection

Make sure Prisma can connect to the upgraded database:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

## ✅ Step 3: Run Database Migration (CRITICAL!)

This creates the migration files for the Notary Network feature:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your database
- Create `NotaryApplication` and `JobOffer` tables
- Add new fields to `Booking` and `notary_profiles` tables

## ✅ Step 4: Generate Prisma Client

Update TypeScript types:

```bash
pnpm dotenv -e .env.local -- pnpm prisma generate
```

## ✅ Step 5: Test Database Operations

Verify everything works:

```bash
pnpm dotenv -e .env.local -- pnpm tsx scripts/test-database-operations.ts
```

## ✅ Step 6: Review Changes

Check what files have changed:

```bash
git status
```

You should see:
- `prisma/schema.prisma` (modified)
- `prisma/migrations/[timestamp]_add_notary_network_models/` (new)
- Various new files for the Notary Network feature

## ✅ Step 7: Stage Changes

Add all the changes:

```bash
# Review changes first
git diff prisma/schema.prisma

# Stage all changes
git add .

# Or stage specific files
git add prisma/
git add app/
git add components/
git add lib/
git add CHANGELOG.md
git add MIGRATION_STATUS.md
git add SUPABASE_UPGRADE_GUIDE.md
# ... etc
```

## ✅ Step 8: Commit Changes

Create a descriptive commit:

```bash
git commit -m "feat: add notary network and hiring system

- Add NotaryApplication and JobOffer models
- Add network distribution fields to Booking model
- Enhance notary_profiles with onboarding fields
- Add admin review interface for applications
- Add job offer system with first-come-first-serve
- Add notary onboarding checklist
- Update Supabase PostgreSQL to latest patched version
- Add database migration for notary network models"
```

## ✅ Step 9: Push to Repository

Push your changes:

```bash
git push origin main
# or
git push origin master
# or your branch name
```

## ✅ Step 10: Monitor Vercel Deployment

After pushing:
1. Check Vercel dashboard for deployment status
2. Verify build succeeds
3. Check that Prisma Client generates correctly
4. Monitor for any runtime errors

## ⚠️ Important Notes

- **Migration files MUST be committed** - Vercel needs them to apply migrations
- **Don't commit `.env.local`** - It's in `.gitignore` (correct!)
- **Vercel will use its own DATABASE_URL** - Already configured in Vercel dashboard
- **First deployment may take longer** - Prisma needs to generate client

## 🚨 If Build Fails

If Vercel build fails:

1. Check build logs for errors
2. Verify DATABASE_URL is set in Vercel environment variables
3. Ensure migration files are in the repo
4. Check that `postinstall.js` runs `prisma generate` successfully

## 📋 Quick Command Summary

```bash
# 1. Verify upgrade
pnpm dotenv -e .env.local -- pnpm tsx scripts/verify-postgres-version.ts

# 2. Run migration
pnpm dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models

# 3. Generate client
pnpm dotenv -e .env.local -- pnpm prisma generate

# 4. Test
pnpm dotenv -e .env.local -- pnpm tsx scripts/test-database-operations.ts

# 5. Review & commit
git status
git add .
git commit -m "feat: add notary network and hiring system"
git push
```

