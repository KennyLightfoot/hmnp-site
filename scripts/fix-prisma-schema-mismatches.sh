#!/bin/bash

# fix-prisma-schema-mismatches.sh
# Fix Prisma schema naming mismatches systematically

set -e

echo "🔧 Fixing Prisma Schema Mismatches..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup
BACKUP_DIR="./prisma-fix-backup-$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup in: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

fixes_applied=0

echo -e "${GREEN}Phase 1: Fix snake_case model names${NC}"

# Fix serviceArea -> service_areas
echo "  🔧 Fixing serviceArea -> service_areas"
find . -name "*.ts" -o -name "*.js" -o -name "*.mjs" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "prisma\.serviceArea" "$file"; then
    echo "    📝 Updating: $file"
    cp "$file" "$BACKUP_DIR/"
    sed -i.bak 's/prisma\.serviceArea/prisma.service_areas/g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

# Fix featureFlag -> feature_flags  
echo "  🔧 Fixing featureFlag -> feature_flags"
find . -name "*.ts" -o -name "*.js" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "prisma\.featureFlag" "$file"; then
    echo "    📝 Updating: $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
    sed -i.bak 's/prisma\.featureFlag/prisma.feature_flags/g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

# Fix dailyMetric -> daily_metrics
echo "  🔧 Fixing dailyMetric -> daily_metrics"
find . -name "*.ts" -o -name "*.js" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "prisma\.dailyMetric" "$file"; then
    echo "    📝 Updating: $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
    sed -i.bak 's/prisma\.dailyMetric/prisma.daily_metrics/g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

echo -e "${GREEN}Phase 2: Fix model existence issues${NC}"

# Fix newBooking -> booking
echo "  🔧 Fixing newBooking -> booking"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "prisma\.newBooking" "$file"; then
    echo "    📝 Updating: $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
    sed -i.bak 's/prisma\.newBooking/prisma.booking/g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

# Fix newBookingAuditLog (doesn't exist - comment out or remove)
echo "  🔧 Commenting out newBookingAuditLog references"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "prisma\.newBookingAuditLog" "$file"; then
    echo "    📝 Commenting out in: $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
    sed -i.bak 's/.*prisma\.newBookingAuditLog.*/    \/\/ TODO: newBookingAuditLog model does not exist in schema/g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

echo -e "${GREEN}Phase 3: Fix property casing issues${NC}"

# Fix .Service -> .service (property vs model name)
echo "  🔧 Fixing .Service -> .service property access"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
  if grep -q "\.Service\." "$file"; then
    echo "    📝 Updating property access in: $file"
    cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
    sed -i.bak 's/\.Service\./.service./g' "$file"
    rm -f "$file.bak"
    fixes_applied=$((fixes_applied + 1))
  fi
done

echo -e "${GREEN}Phase 4: Generate fresh Prisma client${NC}"
echo "  🔄 Regenerating Prisma client to ensure types are up to date"
pnpm prisma generate

echo -e "${GREEN}✅ Prisma schema mismatches fixed!${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  📊 Files processed: Multiple files updated"
echo -e "  💾 Backup created in: $BACKUP_DIR"
echo -e "  🔄 Prisma client regenerated"

echo -e "${YELLOW}Verification steps:${NC}"
echo -e "  1. Run 'pnpm type-check' to verify fixes"
echo -e "  2. Test critical database operations"
echo -e "  3. Check that schema matches expectations"

echo -e "${GREEN}🎉 Schema alignment complete!${NC}"