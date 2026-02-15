# Bloat Analysis & Cleanup Recommendations

**Purpose:** Detailed analysis of unused code, scripts, dependencies, and files that can be removed or archived.

**Last Updated:** 2025-01-XX

---

## Summary

This document identifies:
- **Backup files** that can be deleted
- **One-time scripts** that can be archived
- **Debug/test routes** that should be gated or removed
- **Potentially unused dependencies** that need verification
- **Duplicate code** that can be consolidated

---

## 1. Backup Files (Safe to Delete)

### Component Backups
- ✅ `components/booking/BookingForm.tsx.backup` - Backup of BookingForm
- ✅ `components/booking/BookingWizard-REMOVED.tsx.bak` - Removed component

### Library Backups
- ✅ `lib/bullmq/config.ts.backup` - Backup of BullMQ config
- ✅ `lib/auth/unified-middleware-REMOVED.ts.bak` - Removed middleware

**Action:** Delete these files. They're not referenced anywhere.

---

## 2. Backup Directories (Archive or Delete)

### Batch Backup Directories
- `batch-3-backup-20250802-055827/`
- `batch-4-backup-20250802-060554/`
- `batch-5-backup-20250802-061324/`
- `batch-6-backup-20250802-062117/`

### Pattern Backup Directories
- `common-patterns-backup-20250801-193920/`
- `core-patterns-backup-20250801-203609/`
- `remaining-errors-backup-20250801-163419/`
- `specific-patterns-backup-20250801-194400/`
- `targeted-errors-backup-20250802-051913/`

**Action:** 
- If these contain important code, archive to external storage
- If they're just old backups, delete them
- Add to `.gitignore` if keeping: `batch-*-backup-*/`, `*-backup-*/`

---

## 3. Debug/Test API Routes (Gate or Remove)

### Debug Routes (`/app/api/debug/*`)
- `app/api/debug/route.ts` - Main debug endpoint
- `app/api/debug/booking/route.ts` - Booking debug
- `app/api/debug/ghl/route.ts` - GHL debug
- `app/api/debug/pricing/route.ts` - Pricing debug
- `app/api/debug/availability/route.ts` - Availability debug

**Recommendation:** 
- Gate behind `NODE_ENV !== 'production'` check
- Or remove entirely if not needed

### Test Routes
- `app/api/test-ghl/route.ts` - GHL connection test
- `app/api/test-ghl-calendar/route.ts` - GHL calendar test
- `app/api/test-ghl-setup/route.ts` - GHL setup test
- `app/api/cron-test/route.ts` - Cron job test
- `app/api/system-test/route.ts` - System test
- `app/api/diagnostics/route.ts` - Diagnostics

**Recommendation:**
- Move to `/app/api/dev/*` or `/app/api/test/*`
- Gate behind admin auth or `NODE_ENV !== 'production'`
- Or remove if not actively used

### Compatibility/Legacy Routes
- `app/api/availability-compatible/route.ts` - Legacy availability endpoint
- `app/api/services-compatible/route.ts` - Legacy services endpoint

**Recommendation:**
- Check if these are still used (search codebase for references)
- If unused, remove
- If used, document and plan migration

---

## 4. One-Time Setup/Fix Scripts (Archive or Remove)

### Root-Level Scripts

**Environment Sync Scripts (Keep if Used):**
- `sync-env-to-vercel.sh` - Syncs env vars to Vercel ✅ Keep
- `sync-critical-stripe-vars.sh` - Stripe vars sync ✅ Keep
- `sync-missing-env-to-vercel.sh` - Missing vars sync ✅ Keep
- `sync-all-env-vars.sh` - All vars sync ✅ Keep

**One-Time Fix Scripts (Archive/Remove):**
- `add-critical-missing-env.sh` - One-time env fix ❌ Archive
- `clean-env-for-vercel.sh` - One-time cleanup ❌ Archive
- `fix-database-config.sh` - One-time DB fix ❌ Archive
- `fix-production-env-vars.sh` - One-time prod fix ❌ Archive
- `fix-vercel-env-newlines.sh` - One-time newline fix ❌ Archive
- `force-fix-vercel-env.sh` - One-time force fix ❌ Archive
- `rollback-production-env.sh` - One-time rollback ❌ Archive
- `fix-decimal-safety.sh` - One-time decimal fix ❌ Archive
- `fix-prisma-relationships.sh` - One-time Prisma fix ❌ Archive
- `force-refresh.sh` - One-time refresh ❌ Archive

**Recommendation:** Move to `/scripts/archive/one-time-fixes/` or delete.

### Scripts Directory - Fix Scripts

**One-Time Pattern Fix Scripts:**
- `scripts/fix-batch-3.sh` ❌ Archive
- `scripts/fix-batch-4.sh` ❌ Archive
- `scripts/fix-batch-5.sh` ❌ Archive
- `scripts/fix-batch-6.sh` ❌ Archive
- `scripts/fix-common-errors.sh` ❌ Archive
- `scripts/fix-common-patterns.sh` ❌ Archive
- `scripts/fix-core-patterns.sh` ❌ Archive
- `scripts/fix-final-patterns.sh` ❌ Archive
- `scripts/fix-remaining-errors.sh` ❌ Archive
- `scripts/fix-remaining-patterns.sh` ❌ Archive
- `scripts/fix-specific-patterns.sh` ❌ Archive
- `scripts/fix-targeted-errors.sh` ❌ Archive
- `scripts/fix-typescript-errors.sh` ❌ Archive
- `scripts/fix-model-name-mismatches.sh` ❌ Archive
- `scripts/fix-prisma-schema-mismatches.sh` ❌ Archive
- `scripts/fix-next-batch.sh` ❌ Archive

**Recommendation:** Move to `/scripts/archive/pattern-fixes/` or delete.

### Scripts Directory - Test Scripts (Keep for Development)

**Keep These:**
- `scripts/test-booking-system.ts` ✅ Keep
- `scripts/test-ghl-*.js` ✅ Keep (various GHL tests)
- `scripts/check-booking-health.ts` ✅ Keep
- `scripts/check-services.cjs` ✅ Keep
- `scripts/verify-*.ts` ✅ Keep (various verification scripts)

**Archive These (One-Time Tests):**
- `scripts/test-api-direct.cjs` ❌ Archive
- `scripts/test-booking-api.sh` ❌ Archive
- `scripts/test-contact-form*.js` ❌ Archive (multiple versions)
- `scripts/test-db-connection.cjs` ❌ Archive
- `scripts/test-supabase-direct.cjs` ❌ Archive
- `scripts/simple-booking-test.js` ❌ Archive
- `scripts/final-test.js` ❌ Archive

**Recommendation:** Keep active test scripts, archive one-time tests.

### Scripts Directory - Setup Scripts (Keep Core, Archive One-Time)

**Keep These:**
- `scripts/setup-booking-system.ts` ✅ Keep
- `scripts/setup-ghl-oauth.js` ✅ Keep
- `scripts/setup-ghl-calendars.js` ✅ Keep
- `scripts/setup-business-settings.ts` ✅ Keep
- `scripts/postinstall.js` ✅ Keep (runs on install)

**Archive These (One-Time Setup):**
- `scripts/setup-ghl-complete.js` ❌ Archive (if superseded)
- `scripts/setup-ghl-group-urls.cjs` ❌ Archive (if one-time)
- `scripts/setup-ghl-service-menu.js` ❌ Archive (if one-time)
- `scripts/setup-ghl-webhooks.js` ❌ Archive (if one-time)
- `scripts/setup-external-cron.md` ❌ Archive (documentation)

**Recommendation:** Review each setup script - keep if reusable, archive if one-time.

### Scripts Directory - Debug Scripts (Archive)

**Archive These:**
- `scripts/debug-*.cjs` ❌ Archive (multiple debug scripts)
- `scripts/diagnose-*.js` ❌ Archive (diagnostic scripts)
- `scripts/emergency-*.ts` ❌ Archive (emergency fixes)

**Recommendation:** Move to `/scripts/archive/debug/` or delete.

---

## 5. Potentially Unused Dependencies

### Verify Before Removing

**Check these packages for actual usage:**

1. **`express`** - Next.js handles routing
   - **Check:** `grep -r "require('express')"` or `grep -r "from 'express'"`
   - **Action:** Remove if unused

2. **`body-parser`** - Next.js has built-in body parsing
   - **Check:** `grep -r "body-parser"`
   - **Action:** Remove if unused

3. **`cors`** - Next.js API routes handle CORS
   - **Check:** `grep -r "cors"`
   - **Action:** Remove if unused

4. **`helmet`** - Security headers handled in `next.config.js`
   - **Check:** `grep -r "helmet"`
   - **Action:** Remove if unused

5. **`moment`** - Using `date-fns` and `luxon` instead
   - **Check:** `grep -r "moment\("` (excluding moment-timezone)
   - **Action:** Remove if unused

6. **`moment-timezone`** - Using `date-fns-tz` instead
   - **Check:** `grep -r "moment-timezone"`
   - **Action:** Remove if unused

**How to Verify:**
```bash
# Check if package is imported anywhere
pnpm why express
grep -r "from 'express'" .
grep -r "require('express')" .
```

**Recommendation:** Run verification, then remove unused packages.

---

## 6. Duplicate/Unused Components

### Needs Investigation

**Booking Components:**
- `components/booking/BookingForm.tsx` - Main form ✅ Keep
- `components/booking/BookingForm.tsx.backup` - Backup ❌ Delete
- `components/booking/BookingWizard-REMOVED.tsx.bak` - Removed ❌ Delete
- `components/booking/EnhancedBookingClient.tsx` - Enhanced version ✅ Keep
- Check if `components/enhanced-ui/` duplicates `components/booking/` functionality

**Recommendation:** 
- Delete backup files
- Review `enhanced-ui/` vs `booking/` for duplicates
- Consolidate if duplicates exist

---

## 7. Root-Level Files (Review)

### Documentation Files (Keep)
- `README.md` ✅ Keep
- `CHANGELOG.md` ✅ Keep
- `SECURITY.md` ✅ Keep
- `API_ENDPOINTS_DOCUMENTATION.md` ✅ Keep
- `*.md` files in root (various docs) ✅ Keep

### Configuration Files (Keep)
- `package.json` ✅ Keep
- `tsconfig.json` ✅ Keep
- `next.config.js` ✅ Keep
- `tailwind.config.ts` ✅ Keep
- `vercel.json` ✅ Keep
- `components.json` ✅ Keep

### Environment Files (Review)
- `vercel-production.env` - Production env example ✅ Keep (as example)
- `vercel-production-vars.txt` - Vercel vars ✅ Keep (as reference)
- `vercel-preview-vars.txt` - Preview vars ✅ Keep (as reference)
- `vercel-development-vars.txt` - Dev vars ✅ Keep (as reference)
- `local-vars.txt` - Local vars ❌ Delete (if contains secrets)

**Recommendation:** 
- Keep example/reference files
- Delete files with actual secrets (should be in `.env.local`)

### Test Files (Review)
- `advanced-test.cjs` - Advanced test ❌ Archive if one-time
- `booking-flow-test.mjs` - Booking flow test ❌ Archive if one-time
- `simple-test.cjs` - Simple test ❌ Archive if one-time
- `test-booking-form-validation.html` - HTML test ❌ Archive if one-time

**Recommendation:** Move one-time test files to `/tests/archive/` or delete.

### PDF/Document Files (Review)
- `*.pdf` files in root - Various documents
  - `1-87.pdf` - Unknown document ❓ Review
  - `Houston Mobile Notary Pros LLC - TX - 2024 - Filing Evidence.pdf` - Legal doc ✅ Keep
  - `Insurance.pdf` - Insurance doc ✅ Keep
  - `Online comission signed.pdf` - Commission doc ✅ Keep
  - `ghl_private_integrations.pdf` - GHL docs ✅ Keep

**Recommendation:** 
- Keep legal/important documents
- Move to `/docs/legal/` or `/docs/certificates/`
- Delete if not needed

### JSON Files (Review)
- `BUILD_INFO.json` - Build info ✅ Keep (if used)
- `PERFORMANCE_BASELINE.json` - Performance baseline ✅ Keep (if used)
- `security-audit.json` - Security audit ✅ Keep (if used)
- `schema-sync-report.json` - Schema sync report ❌ Archive (if one-time)

**Recommendation:** Keep active configs, archive one-time reports.

---

## 8. Cleanup Action Plan

### Phase 1: Safe Deletions (No Risk)
1. ✅ Delete backup files (`.backup`, `.bak`, `-REMOVED`)
2. ✅ Delete backup directories (if not needed)
3. ✅ Clean up root-level test files (if one-time)

### Phase 2: Archive One-Time Scripts
1. ✅ Create `/scripts/archive/` directory structure
2. ✅ Move one-time fix scripts to archive
3. ✅ Move one-time test scripts to archive
4. ✅ Update `.gitignore` to exclude archives

### Phase 3: Gate Debug Routes
1. ✅ Add `NODE_ENV` checks to debug routes
2. ✅ Or move debug routes to `/app/api/dev/*`
3. ✅ Add admin auth to test routes

### Phase 4: Verify Dependencies
1. ✅ Run `pnpm why <package>` for each suspect package
2. ✅ Grep codebase for imports
3. ✅ Remove unused dependencies

### Phase 5: Consolidate Components
1. ✅ Review `enhanced-ui/` vs `booking/` for duplicates
2. ✅ Consolidate duplicate components
3. ✅ Update imports

---

## 9. Estimated Cleanup Impact

### Files to Delete
- **Backup files:** ~4 files
- **Backup directories:** ~9 directories
- **One-time scripts:** ~30+ scripts

### Dependencies to Remove (If Unused)
- **express** - ~200KB
- **body-parser** - ~50KB
- **cors** - ~10KB
- **helmet** - ~100KB
- **moment** - ~200KB
- **moment-timezone** - ~50KB

**Total potential savings:** ~600KB+ in node_modules

### Routes to Gate/Remove
- **Debug routes:** ~5 routes
- **Test routes:** ~6 routes
- **Legacy routes:** ~2 routes

---

## 10. Recommendations Summary

### Immediate Actions (Low Risk)
1. Delete backup files (`.backup`, `.bak`)
2. Archive backup directories
3. Delete one-time test files in root

### Short-Term Actions (Medium Risk)
1. Archive one-time fix scripts
2. Gate debug/test routes
3. Verify and remove unused dependencies

### Long-Term Actions (Requires Testing)
1. Consolidate duplicate components
2. Remove legacy API routes (if unused)
3. Clean up root-level files

---

**Next Steps:**
1. Review this analysis
2. Prioritize cleanup actions
3. Create cleanup PRs/branches
4. Test after each cleanup phase

