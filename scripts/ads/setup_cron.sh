#!/bin/bash
# Setup cron jobs for Google Ads automation

echo "Setting up cron jobs for Google Ads automation..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Create the cron jobs
(crontab -l 2>/dev/null; echo "# Google Ads Daily Export - runs every day at 6:00 AM UTC") | crontab -
(crontab -l 2>/dev/null; echo "0 6 * * * cd $PROJECT_DIR && source .venv/bin/activate && python3 scripts/ads/daily_export.py --customer-id 5072649468 --config google-ads.yaml >> logs/ads-daily.log 2>&1") | crontab -

(crontab -l 2>/dev/null; echo "# Google Ads Weekly Summary - runs every Monday at 9:00 AM UTC") | crontab -
(crontab -l 2>/dev/null; echo "0 9 * * 1 cd $PROJECT_DIR && source .venv/bin/activate && python3 scripts/ads/weekly_summary.py --customer-id 5072649468 --config google-ads.yaml >> logs/ads-weekly.log 2>&1") | crontab -

echo "✅ Cron jobs added:"
echo "   - Daily export: 6:00 AM UTC daily"
echo "   - Weekly summary: 9:00 AM UTC every Monday"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To edit cron jobs: crontab -e"
echo "To remove all cron jobs: crontab -r"
echo ""
echo "Logs will be saved to:"
echo "   - logs/ads-daily.log"
echo "   - logs/ads-weekly.log"
