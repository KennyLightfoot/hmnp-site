#!/bin/bash

# Comprehensive script to fix all Prisma relationship field name mismatches
# Changes 'service:' to 'Service:' in Prisma operations throughout the codebase

echo "🔧 Starting comprehensive Prisma relationship fixes..."

# Array of files that need service -> Service relationship fixes
files=(
    "app/api/bookings/[id]/reschedule/route.ts"
    "app/api/bookings/cancel/route.ts"
    "app/api/bookings/pending-payments/route.ts"
    "app/api/bookings/sync/route.ts"
    "app/api/bookings/create/route.ts"
    "app/api/bookings/[id]/route.ts"
    "app/api/bookings/[id]/download/route.ts"
    "app/api/proof/transactions/route.ts"
    "app/api/webhooks/proof/route.ts"
    "app/api/ron/sessions/route.ts"
    "app/api/notary/complete-booking/route.ts"
    "app/api/notary/complete-ron-session/route.ts"
    "app/api/notary/start-ron-session/route.ts"
    "app/api/notary/update-booking-status/route.ts"
    "app/api/cron/check-completions/route.ts"
    "app/api/admin/bookings/[id]/confirm/route.ts"
    "app/api/admin/bookings/process-all/route.ts"
    "lib/notifications.ts"
    "lib/payment-automation.ts"
    "lib/booking-automation.ts"
    "lib/booking-sync.ts"
    "lib/bullmq/worker.ts"
    "lib/cancellation-rescheduling.ts"
    "lib/follow-up-automation.ts"
    "lib/marketing-automation.ts"
    "lib/schedulers/unified-scheduler.ts"
    "lib/queue/workers/paymentWorker.ts"
    "lib/queue/workers/bookingWorker.ts"
    "lib/ai-assistant.ts"
    "lib/ai/intelligent-assistant.ts"
    "lib/advanced-analytics.ts"
    "scripts/testBookingGhlEndToEnd.ts"
)

# Function to fix service -> Service in include statements
fix_include_statements() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "  📝 Fixing include statements in $file"
        sed -i 's/service: true,/Service: true,/g' "$file"
        sed -i 's/service: true;/Service: true;/g' "$file"
        sed -i 's/service: true}/Service: true}/g' "$file"
    fi
}

# Function to fix property access from booking.service to booking.Service
fix_property_access() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "  🔧 Fixing property access in $file"
        sed -i 's/booking\.service\./booking.Service./g' "$file"
        sed -i 's/newBooking\.service\./newBooking.Service./g' "$file"
    fi
}

# Process each file
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "🔄 Processing $file..."
        fix_include_statements "$file"
        fix_property_access "$file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "✅ Completed Prisma relationship fixes!"
echo "🔍 Verifying changes..."

# Verify no service: true patterns remain (should be empty)
remaining=$(grep -r "service: true" --include="*.ts" --include="*.tsx" . | wc -l)
echo "📊 Remaining 'service: true' patterns: $remaining"

if [ "$remaining" -eq 0 ]; then
    echo "🎉 All Prisma relationship fixes completed successfully!"
else
    echo "⚠️  Some patterns may still need manual review"
fi