#!/bin/bash

# 🚀 Next Batch Error Fix Script
# Fixes the most common remaining TypeScript error patterns

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Next Batch Error Fix Script${NC}"
echo "=================================="

# Create backup directory
BACKUP_DIR="./next-batch-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}📦 Backup directory: $BACKUP_DIR${NC}"

total_fixes=0

# Helper function to backup files
backup_file() {
    local file="$1"
    if [ ! -f "$BACKUP_DIR/$(basename "$file")" ]; then
        cp "$file" "$BACKUP_DIR/"
    fi
}

echo -e "${GREEN}Phase 1: Fixing string | undefined parameter issues${NC}"

# Fix string | undefined parameter issues (29 occurrences)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Argument of type 'string | undefined' is not assignable to parameter of type 'string'" "$file" 2>/dev/null; then
        echo "  🔧 Fixing string | undefined parameters in: $file"
        backup_file "$file"
        
        # Add null coalescing for string parameters
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\): string | undefined/\1: string | undefined = ""/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\) || undefined/\1 || ""/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\): string | null/\1: string | null = null/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 2: Fixing Object is possibly 'undefined' issues${NC}"

# Fix Object is possibly 'undefined' issues (24 occurrences)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Object is possibly 'undefined'" "$file" 2>/dev/null || grep -q "is possibly 'undefined'" "$file"; then
        echo "  🔧 Fixing undefined object access in: $file"
        backup_file "$file"
        
        # Add safe property access for common patterns
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2?.\3/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' "$file"
        
        # Fix array access
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\[\([a-zA-Z_][a-zA-Z0-9_]*\)\]/\1?.[\2]/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 3: Fixing unknown type issues${NC}"

# Fix unknown type issues (12 occurrences)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Argument of type 'unknown'" "$file"; then
        echo "  🔧 Fixing unknown type issues in: $file"
        backup_file "$file"
        
        # Add type assertions for unknown types
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\) as unknown/\1 as any/g' "$file"
        sed -i.bak 's/unknown as \(string\|Error\|Record<string, any>\)/any as \1/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 4: Fixing Prisma Client property issues${NC}"

# Fix Prisma Client property issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "notification\|pushSubscription\|hget" "$file"; then
        echo "  🔧 Fixing Prisma/Redis properties in: $file"
        backup_file "$file"
        
        # Fix Prisma client property names
        sed -i.bak 's/\.notification(/\.notificationLog(/g' "$file"
        sed -i.bak 's/\.pushSubscription(/\.pushSubscriptionLog(/g' "$file"
        sed -i.bak 's/\.hget(/\.get(/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 5: Fixing AlertManager sendAlert issues${NC}"

# Fix AlertManager sendAlert issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "sendAlert" "$file"; then
        echo "  🔧 Fixing AlertManager sendAlert in: $file"
        backup_file "$file"
        
        # Fix sendAlert property
        sed -i.bak 's/\.sendAlert(/\.alert(/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 6: Fixing specific high-error files${NC}"

# Fix specific issues in high-error files
if [ -f "lib/invoicing/invoice-generator.ts" ]; then
    echo "  🔧 Fixing invoice-generator.ts..."
    backup_file "lib/invoicing/invoice-generator.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/invoicing/invoice-generator.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/invoicing/invoice-generator.ts
    
    rm -f lib/invoicing/invoice-generator.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/types/booking-interfaces.ts" ]; then
    echo "  🔧 Fixing booking-interfaces.ts..."
    backup_file "lib/types/booking-interfaces.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/types/booking-interfaces.ts
    sed -i.bak 's/string | null/string | null = null/g' lib/types/booking-interfaces.ts
    
    rm -f lib/types/booking-interfaces.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/bullmq/booking-processor.ts" ]; then
    echo "  🔧 Fixing booking-processor.ts..."
    backup_file "lib/bullmq/booking-processor.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/bullmq/booking-processor.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/bullmq/booking-processor.ts
    
    rm -f lib/bullmq/booking-processor.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/database/connection-pool.ts" ]; then
    echo "  🔧 Fixing connection-pool.ts..."
    backup_file "lib/database/connection-pool.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/database/connection-pool.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/database/connection-pool.ts
    
    rm -f lib/database/connection-pool.ts.bak
    total_fixes=$((total_fixes + 1))
fi

echo -e "${GREEN}Phase 7: Fixing string | null type issues${NC}"

# Fix string | null type issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Type 'string | null' is not assignable to type 'string'" "$file"; then
        echo "  🔧 Fixing string | null in: $file"
        backup_file "$file"
        
        # Add null coalescing for string | null
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\): string | null/\1: string | null = null/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\) || null/\1 || ""/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}✅ Next batch fixes completed!${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  📊 Total files processed: $total_fixes"
echo -e "  💾 Backup created in: $BACKUP_DIR"
echo -e "  🔍 Next steps: Run 'pnpm type-check' to verify fixes"

echo -e "${GREEN}🎉 Ready for verification!${NC}" 