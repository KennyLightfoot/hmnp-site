# 🔧 Calendar Availability Issues - Complete Fix Guide

## 🎯 **Root Cause Analysis**

Your calendar availability stopped working due to multiple interconnected issues:

### 1. **Database Schema Mismatch** 
- Prisma schema expects a `type` field on the Service model that doesn't exist in the database
- Connection pooling conflicts with Supabase Transaction Pooler causing "prepared statement already exists" errors

### 2. **Missing Business Settings**
- The BusinessSettings table is empty or not accessible
- Availability API depends on business hours and other settings

### 3. **GHL Calendar Configuration**
- Availability system requires GHL calendar IDs to be properly configured
- Missing or misconfigured calendar mappings

## 🚀 **Complete Fix Instructions**

### **Step 1: Fix Database Connection Issues**

**Problem**: Supabase Transaction Pooler conflicts with Prisma operations

**Solution**: Use direct connection for Prisma operations, then switch back

```bash
# 1. Create a backup of your current .env.local
cp .env.local .env.local.backup

# 2. Temporarily switch to direct connection for Prisma operations
# In your .env.local, change DATABASE_URL from:
# postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres
# to:
# postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres
# (Change port from 6543 to 5432)

# 3. Force push schema and generate client
pnpm exec prisma db push --force-reset --accept-data-loss
pnpm exec prisma generate

# 4. Switch back to pooler connection (port 6543) for runtime
# Change DATABASE_URL back to port 6543 in .env.local
```

### **Step 2: Populate Business Settings**

Create this script as `fix-business-settings-final.cjs`:

```javascript
const { PrismaClient } = require('@prisma/client');

async function populateBusinessSettings() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  console.log('🔧 Populating Business Settings...');
  
  try {
    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connected');

    const settings = [
      { key: 'business_hours_monday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_monday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_tuesday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_tuesday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_wednesday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_wednesday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_thursday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_thursday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_friday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_friday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_saturday_start', value: '10:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_saturday_end', value: '15:00', dataType: 'string', category: 'booking' },
      { key: 'minimum_lead_time_hours', value: '2', dataType: 'number', category: 'booking' },
      { key: 'slot_interval_minutes', value: '30', dataType: 'number', category: 'booking' },
      { key: 'buffer_time_minutes', value: '15', dataType: 'number', category: 'booking' },
      { key: 'blackout_dates', value: JSON.stringify(['2025-01-01', '2025-07-04', '2025-12-25']), dataType: 'json', category: 'booking' }
    ];

    for (const setting of settings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      });
      console.log(`✅ ${setting.key}`);
    }

    const count = await prisma.businessSettings.count({ where: { category: 'booking' } });
    console.log(`\n✅ Created ${count} business settings`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

populateBusinessSettings();
```

Run it:
```bash
node fix-business-settings-final.cjs
```

### **Step 3: Configure GHL Calendar IDs**

Check your `.env.local` file and ensure these are set:

```env
# GHL Calendar IDs (Required for availability)
GHL_STANDARD_NOTARY_CALENDAR_ID=your_calendar_id_here
GHL_EXTENDED_HOURS_CALENDAR_ID=your_calendar_id_here  
GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID=your_calendar_id_here
GHL_BOOKING_CALENDAR_ID=your_calendar_id_here

# GHL API Configuration
GHL_PRIVATE_INTEGRATION_TOKEN=your_token_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_BASE_URL=https://services.leadconnectorhq.com
```

**Get your calendar IDs:**
```bash
node scripts/setup-ghl-calendars.cjs
```

### **Step 4: Test Google Calendar Integration**

If you're using Google Calendar sync, test the connection:

```bash
node tests/manual-tests/test-google-calendar.js
```

**Common Google Calendar Issues:**
1. **Service Account Permissions**: Make sure your service account has access to the calendar
2. **Calendar Sharing**: Share your Google Calendar with the service account email
3. **Sync Conflicts**: Disconnect and reconnect Google Calendar in GHL if needed

### **Step 5: Test the Availability API**

Test with a direct API call:

```bash
curl "http://localhost:3000/api/booking/availability?serviceType=STANDARD_NOTARY&date=2025-01-15&timezone=America/Chicago"
```

Expected successful response:
```json
{
  "success": true,
  "serviceType": "STANDARD_NOTARY",
  "date": "2025-01-15",
  "calendarId": "your_calendar_id",
  "totalSlots": 8,
  "availableSlots": [...]
}
```

## 🔍 **Debugging Checklist**

### ✅ Database Issues Fixed?
- [ ] Prisma schema pushed to database
- [ ] BusinessSettings table populated  
- [ ] Database connection working

### ✅ GHL Configuration Complete?
- [ ] All 4 calendar IDs configured in .env.local
- [ ] GHL API credentials working
- [ ] Calendar availability settings configured in GHL dashboard

### ✅ Google Calendar (if used)?
- [ ] Service account has calendar access
- [ ] Calendar shared with service account email
- [ ] No sync conflicts in GHL

## 🚨 **If Still Not Working**

### **Check GHL Calendar Settings:**
1. Log into your GHL dashboard
2. Go to Calendars section  
3. For each calendar, verify:
   - ✅ Office hours are configured
   - ✅ Availability is enabled
   - ✅ No "Look Busy" blocking all slots
   - ✅ Minimum notice isn't too restrictive

### **Common GHL Issues:**
- **No Office Hours**: Calendar must have defined office hours
- **Google Calendar Conflicts**: Busy events blocking availability
- **Look Busy Settings**: May be set to 100%, blocking all slots
- **Minimum Notice**: Set too high (e.g., 48+ hours)

### **Reset Strategy:**
If nothing works, try creating a fresh calendar in GHL:
1. Create a simple test calendar in GHL dashboard
2. Set basic office hours (9 AM - 5 PM)
3. Get the new calendar ID  
4. Update your .env.local with the new ID
5. Test availability with the new calendar

## 💡 **Prevention Tips**

1. **Use Direct Connection for Prisma Operations**: Always use port 5432 for `prisma db push`, `prisma generate`, and seeding
2. **Regular Business Settings Backup**: Keep a backup of your business settings
3. **Test Availability Weekly**: Set up automated tests for availability endpoints
4. **Monitor GHL Calendar Changes**: Any changes in GHL dashboard can break availability

---

**This should fix your calendar availability issues completely!** Let me know if you need help with any of these steps. 