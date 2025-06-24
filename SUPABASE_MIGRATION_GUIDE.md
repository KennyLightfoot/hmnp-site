# 🚀 Supabase Migration Guide - Neon to Supabase

*Updated: January 2025*

## Overview

This guide walks through migrating Houston Mobile Notary Pros from Neon PostgreSQL to Supabase, providing Auth, Database, Storage, and Edge Functions in one platform.

## 📋 Pre-Migration Checklist

- [ ] Create Supabase project
- [ ] Export Neon database schema and data
- [ ] Update environment variables
- [ ] Test authentication flows
- [ ] Migrate file storage (S3 → Supabase Storage)
- [ ] Update middleware and API routes

## 🏗️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create new project
2. Choose a region (preferably `us-east-1` to match current setup)
3. Set a strong database password
4. Wait for project provisioning (~2 minutes)

## 🔐 Step 2: Update Environment Variables

Replace these variables in `.env.local`:

```bash
# OLD (Neon)
DATABASE_URL=postgresql://neondb_owner:...
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:...

# NEW (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DATABASE_URL_UNPOOLED=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase Auth & API
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

Get these values from your Supabase project dashboard → Settings → API.

## 📊 Step 3: Database Migration

### Option A: Schema-First Migration (Recommended)

```bash
# 1. Export current schema from Neon
pg_dump $DATABASE_URL_NEON --schema-only > neon_schema.sql

# 2. Import to Supabase
psql $DATABASE_URL < neon_schema.sql

# 3. Run Prisma migration to ensure consistency
pnpm prisma db push
```

### Option B: Prisma-First Migration

```bash
# 1. Update DATABASE_URL to Supabase
# 2. Push existing schema
pnpm prisma db push

# 3. Seed with existing data (if needed)
pnpm prisma db seed
```

## 🔄 Step 4: Data Migration

```bash
# Export data from Neon (excluding schema)
pg_dump $DATABASE_URL_NEON --data-only --exclude-table-data=_prisma_migrations > neon_data.sql

# Import data to Supabase
psql $DATABASE_URL < neon_data.sql
```

## 🛡️ Step 5: Enable Row Level Security (RLS)

Supabase requires RLS for security. Add these policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users_ext ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notary_profiles ENABLE ROW LEVEL SECURITY;

-- Basic policies (customize as needed)
CREATE POLICY "Users can view own data" ON users_ext FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON users_ext FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = notary_id);
```

## 🔐 Step 6: Update Authentication

Replace NextAuth with Supabase Auth:

### Update `middleware.ts`:

```typescript
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Update API routes to use Supabase:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your logic here
}
```

## 📁 Step 7: Migrate File Storage

Replace AWS S3 with Supabase Storage:

```typescript
// OLD (S3)
import { S3Client } from '@aws-sdk/client-s3'

// NEW (Supabase Storage)
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`documents/${filename}`, file)
```

## 🧪 Step 8: Testing

1. **Auth Flow**: Test login/logout/signup
2. **Database Operations**: CRUD operations on all models
3. **File Upload**: Document upload and retrieval
4. **API Routes**: All protected routes work correctly

## 🚀 Step 9: Deploy Updates

1. Update Vercel environment variables
2. Deploy to staging first
3. Run smoke tests
4. Deploy to production
5. Monitor for issues

## 🔄 Step 10: Cleanup (After Successful Migration)

1. Remove Neon environment variables
2. Cancel Neon subscription
3. Remove unused dependencies:
   ```bash
   pnpm remove @next-auth/prisma-adapter next-auth
   ```

## 🚨 Rollback Plan

If issues occur:

1. Revert environment variables to Neon
2. Redeploy previous version
3. Debug Supabase issues in development

## 📈 Benefits After Migration

- **Unified Platform**: Auth + DB + Storage + Edge Functions
- **Better Performance**: Global edge network
- **Real-time Features**: Built-in subscriptions
- **Simplified Stack**: Fewer services to manage
- **Cost Savings**: Generous free tier

## 🔗 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review this migration guide
3. Consult Supabase Discord community
4. Contact Supabase support (paid plans) 