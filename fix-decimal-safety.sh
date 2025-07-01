#!/bin/bash

echo "🔧 Starting comprehensive Decimal .toNumber() null safety fixes..."

# Fix health/database route
echo "📝 Fixing app/api/health/database/route.ts"
sed -i 's/s\.basePrice\.toNumber()/s.basePrice?.toNumber() || 0/g' app/api/health/database/route.ts
sed -i 's/s\.depositAmount\.toNumber()/s.depositAmount?.toNumber() || 0/g' app/api/health/database/route.ts

# Fix admin dashboard route
echo "📝 Fixing app/api/admin/dashboard/route.ts"
# These already have proper optional chaining, no changes needed

# Fix bookings route remaining issues
echo "📝 Fixing app/api/bookings/route.ts"
sed -i 's/booking\.priceAtBooking\.toNumber()/booking.priceAtBooking?.toNumber() || 0/g' app/api/bookings/route.ts
sed -i 's/newBooking\.Service\.basePrice\.toNumber()/newBooking.Service.basePrice?.toNumber() || 0/g' app/api/bookings/route.ts

# Fix admin page
echo "📝 Fixing app/admin/page.tsx"
sed -i 's/booking\.priceAtBooking\.toNumber()/booking.priceAtBooking?.toNumber() || 0/g' app/admin/page.tsx

echo "✅ Completed Decimal .toNumber() null safety fixes!"

# Verify changes
echo "🔍 Verifying .toNumber() patterns..."
remaining=$(grep -r "\.toNumber()" --include="*.ts" --include="*.tsx" . | grep -v "?" | wc -l)
echo "📊 Remaining unsafe .toNumber() patterns: $remaining"