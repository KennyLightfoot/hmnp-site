# HMNP Scripts

This directory contains various scripts for development, testing, deployment, and maintenance of the Houston Mobile Notary Pros platform.

## Script Categories

### Setup & Configuration
- `setup-*.ts/js/sh` - Setup various components of the system
- `seed-*.ts/js` - Add sample data to the database
- `create-*.ts/js` - Create resources (GHL fields, tags, etc.)

### Testing & Diagnostics
- `test-*.ts/js/sh` - Test specific functionality
- `verify-*.ts/js/sh` - Verify system configuration
- `diagnose-*.ts/js/cjs` - Diagnose issues
- `check-*.ts/js` - Check system health

### Environment Management
- `env-management/*.sh` - Environment variable management
- `sync-env-*.sh` - Synchronize environment variables

### Database Operations
- `optimize-db-*.sql` - Database optimization scripts
- `backup-database.sh` - Database backup
- `restore-*.cjs` - Restoration scripts

### Cleanup & Maintenance
- `cleanup-*.sh/js` - Clean up resources
- `fix-*.ts/js/sh` - Fix specific issues

### Integrations
- `ghl-*.ts/js` - GoHighLevel integration scripts
- `gmb-*.ts/js` - Google My Business scripts
- `ads/*.py` - Google Ads scripts

## Key Scripts

### Development & Testing
- `test-booking-system.ts` - Test the booking system end-to-end
- `verify-database.sh` - Verify database integrity
- `check-database-state.ts` - Check database state

### Production Operations
- `backup-database.sh` - Backup the production database
- `optimize-db-production.sql` - Optimize the production database
- `setup-business-settings.ts` - Configure business settings

### Advertising & Marketing
- `ads/setup_complete_hmnp.py` - Complete Google Ads setup
- `ads/weekly_summary.py` - Generate weekly ad performance summary

### GoHighLevel Integration
- `setup-ghl-complete.js` - Complete GHL setup
- `setup-ghl-webhooks.js` - Set up GHL webhooks
- `setup-ghl-calendars.js` - Configure GHL calendars

### Environment Management
- `env-management/sync-env-to-vercel.sh` - Sync environment variables to Vercel
- `env-management/check-missing-env.js` - Check for missing environment variables

## Usage

Most scripts can be run using Node.js:

```bash
# TypeScript scripts (with ts-node)
npx ts-node scripts/script-name.ts

# JavaScript scripts
node scripts/script-name.js

# Shell scripts
chmod +x scripts/script-name.sh
./scripts/script-name.sh
```

## Python Scripts

For Python scripts (mainly in the `ads` directory), you'll need to:

1. Install requirements:
   ```bash
   pip install -r scripts/ads/requirements.txt
   ```

2. Run scripts:
   ```bash
   python scripts/ads/script-name.py
   ```

## Script Organization

- `/scripts` - Main scripts directory
  - `/ads` - Google Ads scripts
  - `/archive` - Archived scripts (reference only)
  - `/debug` - Debugging scripts
  - `/env-management` - Environment variable management
  - `/setup` - System setup scripts
  - `/testing` - Testing scripts
  - `/windows-controls` - Scripts for Windows environments

## Important Notes

1. Always check script contents before running
2. Many scripts contain environment-specific operations
3. Scripts with "production" in the name may affect live data
4. Consider using the `--dry-run` flag when available
5. Back up data before running destructive operations