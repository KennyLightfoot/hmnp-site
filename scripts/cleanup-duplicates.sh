#!/bin/bash

# cleanup-duplicates.sh
# Clean up duplicate imports and remaining issues from the automated fix script

set -e

echo "🧹 Starting cleanup of duplicate imports and remaining issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cleaned_files=0

echo -e "${GREEN}Phase 1: Removing duplicate getErrorMessage imports${NC}"

# Find files with duplicate getErrorMessage imports
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v error-fix-backup | while read file; do
    # Count number of getErrorMessage imports
    import_count=$(grep -c "import.*getErrorMessage.*from" "$file" 2>/dev/null || echo "0")
    
    if [ "$import_count" -gt 1 ]; then
        echo "  🔧 Cleaning duplicate imports in: $file"
        
        # Keep only the first import and remove duplicates
        awk '
        /import.*getErrorMessage.*from/ {
            if (!seen_import) {
                seen_import = 1
                print
            }
            next
        }
        { print }
        ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        
        cleaned_files=$((cleaned_files + 1))
    fi
done

echo -e "${GREEN}Phase 2: Removing duplicate DEFAULT_PRICING_OPTIONS imports${NC}"

# Find files with duplicate DEFAULT_PRICING_OPTIONS imports
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v error-fix-backup | while read file; do
    # Count number of DEFAULT_PRICING_OPTIONS imports
    import_count=$(grep -c "import.*DEFAULT_PRICING_OPTIONS.*from" "$file" 2>/dev/null || echo "0")
    
    if [ "$import_count" -gt 1 ]; then
        echo "  🔧 Cleaning duplicate pricing imports in: $file"
        
        # Keep only the first import and remove duplicates
        awk '
        /import.*DEFAULT_PRICING_OPTIONS.*from/ {
            if (!seen_pricing_import) {
                seen_pricing_import = 1
                print
            }
            next
        }
        { print }
        ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        
        cleaned_files=$((cleaned_files + 1))
    fi
done

echo -e "${GREEN}Phase 3: Fixing remaining error.message patterns${NC}"

# Find and fix remaining error.message patterns that weren't caught
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v error-fix-backup | while read file; do
    if grep -q "\.message" "$file" && grep -q "catch.*error" "$file"; then
        # Check if we have getErrorMessage import
        if grep -q "getErrorMessage" "$file"; then
            echo "  🔧 Fixing remaining error patterns in: $file"
            
            # Fix patterns that might have been missed
            sed -i.bak '
                # Fix any remaining direct error.message usage
                s/\berror\.message\b/getErrorMessage(error)/g
                # Fix any error object message access
                s/\([a-zA-Z_][a-zA-Z0-9_]*Error\)\.message\b/getErrorMessage(\1)/g
                # Fix console.error with just error object
                s/console\.error(\([^,)]*\), error)/console.error(\1, getErrorMessage(error))/g
            ' "$file"
            
            rm -f "$file.bak"
            cleaned_files=$((cleaned_files + 1))
        fi
    fi
done

echo -e "${GREEN}Phase 4: Fixing undefined string patterns${NC}"

# Fix common undefined string patterns in test files
find . -name "*.spec.ts" -o -name "*.test.ts" | grep -v node_modules | grep -v .git | grep -v error-fix-backup | while read file; do
    if grep -q "page\.fill.*dateString)" "$file"; then
        echo "  🧪 Fixing undefined dateString in: $file"
        
        # Fix page.fill with potentially undefined values
        sed -i.bak 's/page\.fill(\([^,]*\), dateString)/page.fill(\1, dateString || "")/g' "$file"
        
        rm -f "$file.bak"
        cleaned_files=$((cleaned_files + 1))
    fi
done

echo -e "${GREEN}Phase 5: Fixing incomplete pricing options${NC}"

# Fix partial pricing options that still need all properties
find ./tests -name "*.ts" | grep -v node_modules | grep -v .git | grep -v error-fix-backup | while read file; do
    if grep -q "options:.*{.*priority.*}" "$file"; then
        echo "  🧪 Fixing incomplete pricing options in: $file"
        
        # Replace partial options with createPricingOptions helper
        sed -i.bak '
            # Add import for createPricingOptions if not present
            /^import.*DEFAULT_PRICING_OPTIONS.*from/a\
import { createPricingOptions } from '\''@/tests/helpers/pricing-defaults'\'';

            # Replace partial options with helper function
            s/options: { priority: true }/options: createPricingOptions({ priority: true })/g
            s/options: { weatherAlert: true }/options: createPricingOptions({ weatherAlert: true })/g
            s/options: { sameDay: true }/options: createPricingOptions({ sameDay: true })/g
        ' "$file"
        
        rm -f "$file.bak"
        cleaned_files=$((cleaned_files + 1))
    fi
done

echo -e "${GREEN}Phase 6: Removing backup directory references${NC}"

# Remove any accidental backup directory processing
if [ -d "./error-fix-backup-"* ]; then
    echo "  🗑️  Removing accidentally processed backup files..."
    rm -rf ./error-fix-backup-*/error-fix-backup-*
fi

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  📊 Files cleaned: $cleaned_files"
echo -e "  🔧 Removed duplicate imports"
echo -e "  🔧 Fixed remaining error patterns"
echo -e "  🔧 Fixed undefined string patterns"
echo -e "  🔧 Fixed incomplete pricing options"

echo -e "${GREEN}🎉 Ready for next type check!${NC}"