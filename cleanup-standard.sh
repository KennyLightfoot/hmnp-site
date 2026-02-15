#!/bin/bash
# =============================================================================
# HMNP Site - Repo Cleanup Script
# =============================================================================
# Run from the root of the hmnp-site repo
# REVIEW BEFORE RUNNING - this is destructive!
# Make sure you have a backup or can recover from git history.
# =============================================================================
set -e
echo "🧹 HMNP Site Repo Cleanup"
echo "========================="
echo ""

# Safety check
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
  echo "❌ Must be run from the hmnp-site root directory!"
  exit 1
fi

# ─────────────────────────────────────────────────────────
# PHASE 1: Remove dangerous/sensitive files
# ─────────────────────────────────────────────────────────
echo "🚨 PHASE 1: Removing sensitive files..."
rm -f houston-mobile-notary-calendar-a4c70e6a64ec.json
rm -f .env.backup
rm -f .env.backup-20250709-133908
rm -f scripts/.env-gmb-temp
rm -f security-audit.json
echo " ✅ Sensitive files removed"

# ─────────────────────────────────────────────────────────
# PHASE 2: Remove Python venv (274 MB)
# ─────────────────────────────────────────────────────────
echo "🗑 PHASE 2: Removing Python venv..."
rm -rf venv-ads/
echo " ✅ venv-ads/ removed (274 MB freed)"

# ─────────────────────────────────────────────────────────
# PHASE 3: Remove backup directories
# ─────────────────────────────────────────────────────────
echo "🗑 PHASE 3: Removing backup directories..."
rm -rf batch-3-backup-20250802-055827/
rm -rf batch-4-backup-20250802-060554/
rm -rf batch-5-backup-20250802-061324/
rm -rf batch-6-backup-20250802-062117/
rm -rf common-patterns-backup-20250801-193920/
rm -rf core-patterns-backup-20250801-203609/
rm -rf remaining-errors-backup-20250801-163419/
rm -rf specific-patterns-backup-20250801-194400/
rm -rf targeted-errors-backup-20250802-051913/
echo " ✅ Backup directories removed"

# ─────────────────────────────────────────────────────────
# PHASE 4: Remove business documents (don't belong in code repo)
# ─────────────────────────────────────────────────────────
echo "🗑 PHASE 4: Removing business documents..."
rm -f "1-87.pdf"
rm -f "Insurance.pdf"
rm -f "Houston Mobile Notary Pros LLC - TX - 2024 - Filing Evidence.pdf"
rm -f "Online comission signed.pdf"
rm -f "ghl_private_integrations.pdf"
rm -f "HMNP_Updated_SOP.docx"
echo " ✅ Business documents removed (save these elsewhere!)"

# ─────────────────────────────────────────────────────────
# PHASE 5: Remove duplicates
# ─────────────────────────────────────────────────────────
echo "🗑 PHASE 5: Removing duplicates..."
rm -rf styles/ # styles/globals.css is unused; app/globals.css is active
rm -f next-sitemap.config.js # Keep .mjs version
rm -f route.ts # Orphaned root-level route file
rm -f useAsyncState.ts # Orphaned; also in backups (now deleted)
echo " ✅ Duplicates removed"

# ─────────────────────────────────────────────────────────
# PHASE 6: Organize loose root files
# ─────────────────────────────────────────────────────────
echo "📁 PHASE 6: Organizing root files..."
# Create organization dirs
mkdir -p docs/setup-guides
mkdir -p docs/troubleshooting
mkdir -p docs/audits
mkdir -p docs/marketing
mkdir -p docs/archive
mkdir -p scripts/debug
mkdir -p scripts/env-management
mkdir -p scripts/setup
mkdir -p scripts/testing

# --- Move debug scripts to scripts/debug/ ---
for f in debug-availability.cjs debug-service.cjs debug-sunday.cjs debug-timezone.cjs; do
  [ -f "$f" ] && mv "$f" scripts/debug/
done

# --- Move test scripts to scripts/testing/ ---
for f in test-api-direct.cjs test-booking-system.js test-contact-form-fix.js \
  test-contact-form-production.js test-contact-form.js test-db-connection.cjs \
  test-fixes.js test-ghl.cjs test-supabase-direct.cjs simple-test.cjs \
  simple-booking-test.js advanced-test.cjs final-test.js \
  booking-flow-test.mjs test-booking-form-validation.html test-booking-api.sh; do
  [ -f "$f" ] && mv "$f" scripts/testing/
done

# --- Move env management scripts ---
for f in add-critical-missing-env.sh check-missing-env.js clean-env.cjs clean-env-for-vercel.sh \
  compare-env-variables.js compare-environments.sh env-alignment-checker.sh \
  env-cleanup-execute.sh fix-production-env-vars.sh fix-vercel-env-newlines.sh \
  force-fix-vercel-env.sh get-vercel-vars.sh parse-env-local.sh quick-env-sync.sh \
  rollback-production-env.sh sync-all-env-vars.sh sync-critical-stripe-vars.sh \
  sync-env-to-vercel.sh sync-missing-env-to-vercel.sh sync-to-vercel.sh \
  update-vercel-stripe-env.sh check-agents-env.mjs setup-env.js; do
  [ -f "$f" ] && mv "$f" scripts/env-management/
done

# --- Move setup scripts ---
for f in setup-business-direct.js setup-complete-system.mjs setup_ghl_pipelines.cjs \
  create-sample-data.mjs fix-business-settings-final.cjs migrate-to-supabase.cjs \
  pricing-investigation-fixes.js stripe-setup-commands.sh webhook-setup.sh \
  database-health-check.mjs; do
  [ -f "$f" ] && mv "$f" scripts/setup/
done

# --- Move operational scripts ---
for f in fix-database-config.sh fix-decimal-safety.sh fix-prisma-relationships.sh \
  run-migration.sh run_migration2.sh generate-and-push.sh force-refresh.sh \
  get-webhook-details.sh verify-database.sh verify-production-fix.sh \
  commit-all-changes.sh check_unused_files.sh; do
  [ -f "$f" ] && mv "$f" scripts/
done

# --- Move orphaned lib-style TS files (these likely belong in lib/) ---
mkdir -p docs/archive/orphaned-root-ts
for f in advanced-analytics.ts advanced-page-speed.ts ai-assistant.ts analytics-tracker.ts \
  kpi-tracker.ts payment-retry-service.ts performance-monitor.ts rate-limit.ts; do
  [ -f "$f" ] && mv "$f" docs/archive/orphaned-root-ts/
done

# --- Move documentation to docs/ ---
# Audits
for f in BLOAT_ANALYSIS.md CONTENT_AUDIT_REPORT.md CRITICAL_ISSUES_AUDIT_REPORT.md \
  DEPENDENCY_AUDIT.md SECURITY_AUDIT_REPORT.md SECURITY_REMEDIATION.md \
  SECURITY_RESOLUTION_SUMMARY.md SECURITY_SCAN_SUMMARY.md \
  TECHNICAL_DIRECTOR_REVIEW.md BUSINESS_MODEL_ALIGNMENT_REPORT.md \
  PRICING_INVESTIGATION_FINAL_REPORT.md CITATION_FIX_CHECKLIST.md \
  CITATION_NAP_AUDIT_MASTER.md; do
  [ -f "$f" ] && mv "$f" docs/audits/
done

# Setup/troubleshooting guides
for f in FIX_DATABASE_CONNECTION.md FIX_ENV_LOADING.md FIX_IMPLEMENTATION_PLAN.md \
  FIX_MIGRATION_ERROR.md FIX_STUCK_MIGRATION.md FIX_YELP_AND_GBP_STEPS.md \
  CONSOLE_ERROR_FIXES.md QUICK_FIX_MIGRATION.md QUICK_FIX_REFERENCE.md \
  SETUP_DATABASE_URL.md SETUP_ENV.md SETUP_ENV_LOCAL.md \
  MIGRATION_INSTRUCTIONS.md MIGRATION_SIMPLE_TO_ENHANCED.md MIGRATION_STATUS.md \
  POST_UPGRADE_CHECKLIST.md SUPABASE_UPGRADE_GUIDE.md \
  PRODUCTION-FIX-README.md DB_BACKUPS_AND_MONITORING.md; do
  [ -f "$f" ] && mv "$f" docs/troubleshooting/
done

# GMB/GBP docs
mkdir -p docs/gmb
for f in GMB_ACCOUNT_LOCATION_ID_GUIDE.md GMB_APP_PUBLISHED_NEXT_STEPS.md \
  GMB_GOOGLE_500_ERROR_FIX.md GMB_HTML_RESPONSE_ERROR_FIX.md \
  GMB_MANUAL_ACCOUNT_LOCATION_ID_GUIDE.md GMB_OAUTH_CLIENT_SETUP.md \
  GMB_OAUTH_CONSENT_SCREEN_FIX.md GMB_OAUTH_CONSENT_SCREEN_NAVIGATION.md \
  GMB_OAUTH_SETUP_GUIDE.md GMB_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md \
  GMB_PROJECT_DECISION_GUIDE.md GMB_PROJECT_SELECTION_GUIDE.md \
  GMB_REDIRECT_URI_FIX.md GMB_SCRIPTS_ENV_FIX.md GMB_SETUP_ORDER.md \
  GMB_TROUBLESHOOTING.md GOOGLE_CLOUD_PROJECT_CONSOLIDATION.md \
  GBP_CONTENT_ENHANCEMENTS.md GBP_MANUAL_OPTIMIZATION_GUIDE.md \
  GBP_OPTIMIZATION_AUDIT.md MANUAL_OPTIMIZATION_CHECKLIST.md; do
  [ -f "$f" ] && mv "$f" docs/gmb/
done

# Marketing docs
for f in HMNP_Google_Ads_Setup.md GA4_AUDIENCES_REMARKETING_PLAN.md \
  CALL_TRACKING_OFFLINE_CONVERSION_PLAN.md LOOKER_STUDIO_DASHBOARD_SPEC.md \
  MARKETING_SOPS.md PPC_CAMPAIGN_STRATEGY_77591.md \
  PHASE_4_CONTENT_MARKETING_STRATEGY.md PHASE_4_IMPLEMENTATION_PLAN.md \
  PHASE_6_CITATION_SUBMISSIONS.md; do
  [ -f "$f" ] && mv "$f" docs/marketing/
done

# Architecture/reference docs (keep in docs/)
for f in ARCHITECTURE_OVERVIEW.md API_ENDPOINTS_DOCUMENTATION.md API_ROUTES_DEEP_DIVE.md \
  ENV_REFERENCE.md REQUIRED_APIS_COMPLETE_LIST.md SECURITY.md \
  UNIFIED_SERVICE_SCHEMA.md SERVICE_IMPLEMENTATION_PLAN.md \
  NOTARY_NETWORK_IMPLEMENTATION_SUMMARY.md SOP_ENHANCED.md \
  GHL_MASTER_WORKFLOW_SETUP_GUIDE.md GHL_SERVICE_SETUP_COMPLETE.md; do
  [ -f "$f" ] && mv "$f" docs/
done

# Move remaining misc files
for f in BOOKING_FLOW_TESTING_GUIDE.md BOOKING_SYSTEM_TESTS.md QUICK_TEST_CHECKLIST.md \
  QUICK_REFERENCE.md MAIN_BRANCH_STATUS.md CLAUDE_CODE_SIMPLIFICATION_PROMPT.md; do
  [ -f "$f" ] && mv "$f" docs/
done

# Move data files
mkdir -p docs/data
for f in PRICING.csv PRICING.md DEPENDENCY_BASELINE.txt BUILD_INFO.json \
  PERFORMANCE_BASELINE.json vars-to-add.txt vars-to-remove.txt \
  vercel-development-vars.txt vercel-preview-vars.txt vercel-production-vars.txt \
  houstonmobilenotarypros.com_mega_export_20251123.csv schema-sync-report.json; do
  [ -f "$f" ] && mv "$f" docs/data/
done

# Move n8n workflow to docs
[ -f "n8n.json" ] && mv "n8n.json" docs/

# Move @New Notepad
[ -f "@New Notepad" ] && mv "@New Notepad" docs/app-specification.md

# Move windows-controls to scripts
[ -d "windows-controls" ] && mv windows-controls/ scripts/

# Move test-results to tests
[ -d "test-results" ] && mv test-results/ tests/

# Move seo to docs/marketing
[ -d "seo" ] && mv seo/ docs/marketing/

# Move start/stop automation
for f in start-automation.sh stop-automation.sh; do
  [ -f "$f" ] && mv "$f" scripts/
done

echo " ✅ Root files organized"

# ─────────────────────────────────────────────────────────
# PHASE 7: Remove more bloat (build artifacts, extra venvs, junk files)
# ─────────────────────────────────────────────────────────
echo "🗑 PHASE 7: Removing build artifacts and junk..."
rm -rf .venv 2>/dev/null
rm -rf .next 2>/dev/null
rm -rf .obsidian 2>/dev/null
rm -rf playwright-report 2>/dev/null
rm -rf logs 2>/dev/null
rm -f "elect pid, state, wait_event_type, wait_event, query" 2>/dev/null
rm -f "hmnp-site@0.1.0" 2>/dev/null
rm -f dotenv 2>/dev/null
rm -f dev.log 2>/dev/null
find . -maxdepth 1 -name "*Zone.Identifier" -delete 2>/dev/null

# Move remaining loose docs
for f in fee-schedule.md hm.plan.md pre-launch-checklist.md pricing-investigation-analysis.md; do
  [ -f "$f" ] && mv "$f" docs/
done
[ -f "migrations.sql" ] && mv migrations.sql docs/troubleshooting/

echo " ✅ Build artifacts and junk removed"

# ─────────────────────────────────────────────────────────
# PHASE 8: Update .gitignore
# ─────────────────────────────────────────────────────────
echo "📝 PHASE 8: Updating .gitignore..."
# Add entries if not already present
ADDITIONS=(
  ""
  "# Business documents"
  "*.pdf"
  "*.docx"
  ""
  "# Python"
  "venv-ads/"
  ".venv/"
  "__pycache__/"
  ""
  "# Sensitive files"
  "*.p12"
  "*service-account*.json"
  "*-calendar-*.json"
  ""
  "# IDE/editor files"
  "@New Notepad"
  ".obsidian/"
  ""
  "# Build artifacts (already in gitignore but reinforcing)"
  "dev.log"
  "*Zone.Identifier"
)

for line in "${ADDITIONS[@]}"; do
  if [ -z "$line" ] || ! grep -qF "$line" .gitignore 2>/dev/null; then
    echo "$line" >> .gitignore
  fi
done

echo " ✅ .gitignore updated"

# ─────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary of what was done:"
echo " - Removed sensitive credential files"
echo " - Removed venv-ads/ and .venv/ (~508 MB)"
echo " - Removed 9 backup directories"
echo " - Removed 5 PDFs and 1 docx"
echo " - Removed duplicate files"
echo " - Removed build artifacts and junk files"
echo " - Organized 200+ root files into proper directories"
echo " - Updated .gitignore"
echo ""
echo "⚠️ NEXT STEPS:"
echo " 1. ROTATE ALL CREDENTIALS (they're in git history!)"
echo " 2. Review the changes: git status"
echo " 3. Commit: git add -A && git commit -m 'chore: major repo cleanup'"
echo " 4. Consider using BFG Repo Cleaner to purge secrets from history"
echo " 5. Force push: git push --force-with-lease"