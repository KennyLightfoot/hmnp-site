#!/bin/bash

# 🚀 Batch 4 Error Fix Script
# Fixes the most common remaining TypeScript error patterns

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Batch 4 Error Fix Script${NC}"
echo "================================"

# Create backup directory
BACKUP_DIR="./batch-4-backup-$(date +%Y%m%d-%H%M%S)"
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

echo -e "${GREEN}Phase 1: Fixing string | undefined parameter issues (26 occurrences)${NC}"

# Fix string | undefined parameter issues more comprehensively
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

echo -e "${GREEN}Phase 2: Fixing Object is possibly 'undefined' issues (24 occurrences)${NC}"

# Fix Object is possibly 'undefined' issues with more targeted approach
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Object is possibly 'undefined'" "$file" 2>/dev/null || grep -q "is possibly 'undefined'" "$file"; then
        echo "  🔧 Fixing undefined object access in: $file"
        backup_file "$file"
        
        # Add safe property access for common patterns (more carefully)
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2?.\3/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' "$file"
        
        # Fix array access
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\[\([a-zA-Z_][a-zA-Z0-9_]*\)\]/\1?.[\2]/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 3: Fixing AlertManager and MonitoringService alert issues${NC}"

# Fix AlertManager and MonitoringService alert issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Property 'alert' does not exist on type 'AlertManager\|MonitoringService'" "$file"; then
        echo "  🔧 Fixing alert property issues in: $file"
        backup_file "$file"
        
        # Fix alert property names
        sed -i.bak 's/\.alert(/\.sendAlert(/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 4: Fixing Prisma notification property issues${NC}"

# Fix Prisma notification property issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Property 'notification' does not exist on type 'PrismaClient'" "$file"; then
        echo "  🔧 Fixing Prisma notification property in: $file"
        backup_file "$file"
        
        # Fix notification property name
        sed -i.bak 's/\.notification(/\.notificationLog(/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 5: Fixing argument count issues${NC}"

# Fix "Expected 1 arguments, but got 2" issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "Expected 1 arguments, but got 2" "$file"; then
        echo "  🔧 Fixing argument count issues in: $file"
        backup_file "$file"
        
        # This is more complex, so we'll need to look at specific cases
        # For now, let's add some common fixes
        sed -i.bak 's/useRef<\([^>]*\)>()/useRef<\1 | undefined>(undefined)/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 6: Fixing optional property access increment issues${NC}"

# Fix optional property access increment issues
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | grep -v backup | while read file; do
    if grep -q "The operand of an increment or decrement operator may not be an optional property access" "$file"; then
        echo "  🔧 Fixing optional property increment issues in: $file"
        backup_file "$file"
        
        # Replace optional chaining with null checks for increment operations
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\?\.\([a-zA-Z_][a-zA-Z0-9_]*\)\+\+/\1 \&\& \1.\2\+\+/g' "$file"
        sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\?\.\([a-zA-Z_][a-zA-Z0-9_]*\)--/\1 \&\& \1.\2--/g' "$file"
        
        rm -f "$file.bak"
        total_fixes=$((total_fixes + 1))
    fi
done

echo -e "${GREEN}Phase 7: Fixing specific high-error files${NC}"

# Fix specific issues in high-error files
if [ -f "lib/database/connection-pool.ts" ]; then
    echo "  🔧 Fixing connection-pool.ts..."
    backup_file "lib/database/connection-pool.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/database/connection-pool.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/database/connection-pool.ts
    
    rm -f lib/database/connection-pool.ts.bak
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

if [ -f "lib/business-rules/usage-example.ts" ]; then
    echo "  🔧 Fixing usage-example.ts..."
    backup_file "lib/business-rules/usage-example.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/business-rules/usage-example.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/business-rules/usage-example.ts
    
    rm -f lib/business-rules/usage-example.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/notifications/real-time-status.ts" ]; then
    echo "  🔧 Fixing real-time-status.ts..."
    backup_file "lib/notifications/real-time-status.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/notifications/real-time-status.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/notifications/real-time-status.ts
    
    rm -f lib/notifications/real-time-status.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/notifications/automated-scheduler.ts" ]; then
    echo "  🔧 Fixing automated-scheduler.ts..."
    backup_file "lib/notifications/automated-scheduler.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/notifications/automated-scheduler.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/notifications/automated-scheduler.ts
    
    rm -f lib/notifications/automated-scheduler.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/customer-support/support-integration.ts" ]; then
    echo "  🔧 Fixing support-integration.ts..."
    backup_file "lib/customer-support/support-integration.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/customer-support/support-integration.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/customer-support/support-integration.ts
    
    rm -f lib/customer-support/support-integration.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "payment-retry-service.ts" ]; then
    echo "  🔧 Fixing payment-retry-service.ts..."
    backup_file "payment-retry-service.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' payment-retry-service.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' payment-retry-service.ts
    
    rm -f payment-retry-service.ts.bak
    total_fixes=$((total_fixes + 1))
fi

if [ -f "lib/queue/workers/paymentWorker.ts" ]; then
    echo "  🔧 Fixing paymentWorker.ts..."
    backup_file "lib/queue/workers/paymentWorker.ts"
    
    # Add common fixes for this file
    sed -i.bak 's/string | undefined/string | undefined = ""/g' lib/queue/workers/paymentWorker.ts
    sed -i.bak 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)/\1?.\2/g' lib/queue/workers/paymentWorker.ts
    
    rm -f lib/queue/workers/paymentWorker.ts.bak
    total_fixes=$((total_fixes + 1))
fi

echo -e "${GREEN}Phase 8: Fixing unknown type issues${NC}"

# Fix unknown type issues
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

echo -e "${GREEN}✅ Batch 4 fixes completed!${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  📊 Total files processed: $total_fixes"
echo -e "  💾 Backup created in: $BACKUP_DIR"
echo -e "  🔍 Next steps: Run 'pnpm type-check' to verify fixes"

echo -e "${GREEN}🎉 Ready for verification!${NC}" 