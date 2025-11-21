#!/bin/bash
# Database Backup Script for Supabase
# Creates a full logical backup before upgrades

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Starting Database Backup...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL environment variable not set${NC}"
    echo "Please set DATABASE_URL in your environment or .env.local file"
    exit 1
fi

# Create backups directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/supabase-backup-$TIMESTAMP.sql"

echo -e "${YELLOW}📦 Creating backup: $BACKUP_FILE${NC}"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${YELLOW}⚠️  pg_dump not found. Installing PostgreSQL client tools...${NC}"
    echo "On Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "On macOS: brew install postgresql"
    echo ""
    echo "Alternatively, use Supabase dashboard backup feature:"
    echo "https://supabase.com/dashboard/project/unnyhvuhobnmxnpffore/settings/database"
    exit 1
fi

# Create backup using pg_dump
echo -e "${YELLOW}⏳ Running pg_dump (this may take a few minutes)...${NC}"

if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>&1; then
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo -e "   File: $BACKUP_FILE"
    echo -e "   Size: $FILE_SIZE"
    echo ""
    echo -e "${GREEN}📋 Backup Summary:${NC}"
    echo "   - Timestamp: $TIMESTAMP"
    echo "   - Location: $BACKUP_FILE"
    echo "   - Size: $FILE_SIZE"
    echo ""
    echo -e "${YELLOW}💡 Next Steps:${NC}"
    echo "   1. Verify backup: head -n 20 $BACKUP_FILE"
    echo "   2. Store backup securely (consider cloud storage)"
    echo "   3. Proceed with Supabase upgrade"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Please check your DATABASE_URL and try again"
    exit 1
fi

