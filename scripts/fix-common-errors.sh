#!/bin/bash

# fix-common-errors.sh
# Automated script to fix common TypeScript error patterns

set -e

echo "🚀 Starting automated error fixes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory
BACKUP_DIR="./error-fix-backup-$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup in: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

# Function to backup a file before modifying
backup_file() {
    local file="$1"
    local backup_path="$BACKUP_DIR/$(dirname "$file")"
    mkdir -p "$backup_path"
    cp "$file" "$backup_path/"
}

# Counter for fixes
total_fixes=0

echo -e "${GREEN}Phase 1: Fixing error.message patterns in catch blocks${NC}"

# Find files with error.message patterns (excluding node_modules and .git)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | while read file; do
    if grep -q "catch.*error.*{" "$file" && grep -q "error\.message" "$file"; then
        echo "  📝 Fixing error handling in: $file"
        backup_file "$file"
        
        # Fix simple error.message cases
        sed -i.bak '
            # Handle error.message in console.log/error statements
            s/console\.error(\([^,]*\), error\.message)/console.error(\1, error instanceof Error ? error.message : String(error))/g
            s/console\.log(\([^,]*\), error\.message)/console.log(\1, error instanceof Error ? error.message : String(error))/g
            
            # Handle standalone error.message
            s/error\.message/error instanceof Error ? error.message : String(error)/g
        ' "$file"
        
        # Remove the .bak file created by sed
        rm -f "$file.bak"
        
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 2: Adding import for getErrorMessage utility${NC}"

# Add imports for the error utility where needed
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | while read file; do
    if grep -q "error instanceof Error ? error.message : String(error)" "$file"; then
        if ! grep -q "import.*getErrorMessage.*from" "$file"; then
            echo "  📦 Adding getErrorMessage import to: $file"
            backup_file "$file"
            
            # Add import at the top of the file after existing imports
            sed -i.bak '
                /^import.*from/a\
import { getErrorMessage } from '\''@/lib/utils/error-utils'\'';
            ' "$file"
            
            # Replace the verbose error handling with the utility
            sed -i.bak 's/error instanceof Error ? error\.message : String(error)/getErrorMessage(error)/g' "$file"
            
            rm -f "$file.bak"
        fi
    fi
done

echo -e "${GREEN}Phase 3: Fixing empty options objects in tests${NC}"

# Fix empty options objects in test files
find ./tests -name "*.test.ts" 2>/dev/null | while read file; do
    if grep -q "options: {}" "$file"; then
        echo "  🧪 Fixing test options in: $file"
        backup_file "$file"
        
        # Add import for pricing defaults if not present
        if ! grep -q "import.*DEFAULT_PRICING_OPTIONS.*from" "$file"; then
            sed -i.bak '
                /^import.*from/a\
import { DEFAULT_PRICING_OPTIONS } from '\''@/tests/helpers/pricing-defaults'\'';
            ' "$file"
        fi
        
        # Replace empty options with defaults
        sed -i.bak 's/options: {}/options: DEFAULT_PRICING_OPTIONS/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 4: Fixing undefined/null string patterns${NC}"

# Fix common undefined string patterns
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | while read file; do
    if grep -q "\.fill.*," "$file" && grep -q "string.*undefined" "$file"; then
        echo "  🔧 Fixing undefined string patterns in: $file"
        backup_file "$file"
        
        # Fix page.fill patterns with potential undefined values
        sed -i.bak 's/page\.fill(\([^,]*\), \([^)]*\))/page.fill(\1, \2 || '\'''\'')/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 5: Creating TypeScript path aliases${NC}"

# Check if tsconfig has our path aliases
if ! grep -q "@/lib/utils/error-utils" tsconfig.json 2>/dev/null; then
    echo "  ⚙️  Consider adding path aliases to tsconfig.json for cleaner imports"
fi

echo -e "${GREEN}✅ Automated fixes completed!${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  📊 Total files processed: $total_fixes"
echo -e "  💾 Backup created in: $BACKUP_DIR"
echo -e "  🔍 Next steps: Run 'pnpm type-check' to verify fixes"

echo -e "${YELLOW}Manual review required for:${NC}"
echo -e "  • Complex error handling logic"
echo -e "  • API route error responses"  
echo -e "  • Custom error types"

echo -e "${GREEN}🎉 Ready for manual verification and testing!${NC}"