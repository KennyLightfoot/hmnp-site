import * as dotenv from 'dotenv';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getCalendarSlots } from '@/lib/ghl/management';

dotenv.config({ path: '.env.local' });

async function diagnoseGHLCalendar() {
  console.log('🔍 GHL Calendar Diagnostic Tool\n');
  
  try {
    const serviceType = 'STANDARD_NOTARY';
    const calendarId = getCalendarIdForService(serviceType);
    const testDate = '2025-07-15';
    
    console.log(`📅 Testing calendar: ${calendarId}`);
    console.log(`🗓️  Service: ${serviceType}`);
    console.log(`📆 Date: ${testDate}\n`);
    
    // Get calendar slots (which includes calendar details)
    const result = await getCalendarSlots(calendarId, testDate, testDate);
    
    console.log('═'.repeat(80));
    console.log('📋 GHL CALENDAR ANALYSIS');
    console.log('═'.repeat(80));
    
    if (result.calendarDetails && result.calendarDetails.calendar) {
      const calendar = result.calendarDetails.calendar;
      
      console.log(`✅ Calendar Found: ${calendar.name}`);
      console.log(`📍 Calendar ID: ${calendar.id}`);
      console.log(`🏢 Location ID: ${calendar.locationId}`);
      console.log(`👥 Group ID: ${calendar.groupId}`);
      console.log(`📊 Status: ${calendar.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`🕐 Slot Duration: ${calendar.slotDuration} ${calendar.slotDurationUnit}`);
      console.log(`⚡ Slot Interval: ${calendar.slotInterval} ${calendar.slotIntervalUnit}`);
      console.log(`🛡️  Buffer Time: ${calendar.slotBuffer} ${calendar.slotBufferUnit}\n`);
      
      // Team Members Analysis
      console.log('👥 TEAM MEMBERS:');
      if (calendar.teamMembers && calendar.teamMembers.length > 0) {
        calendar.teamMembers.forEach((member, index) => {
          console.log(`  ${index + 1}. User ID: ${member.userId}`);
          console.log(`     Priority: ${member.priority}`);
          console.log(`     Selected: ${member.selected ? '✅' : '❌'}`);
          console.log(`     Primary: ${member.isPrimary ? '✅' : '❌'}`);
          console.log('');
        });
      } else {
        console.log('  ❌ No team members assigned');
      }
      
      // Open Hours Analysis
      console.log('🕐 OPEN HOURS:');
      if (calendar.openHours && calendar.openHours.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        calendar.openHours.forEach((schedule, index) => {
          const dayNames = schedule.daysOfTheWeek.map(day => days[day]).join(', ');
          schedule.hours.forEach(hour => {
            const start = `${hour.openHour.toString().padStart(2, '0')}:${hour.openMinute.toString().padStart(2, '0')}`;
            const end = `${hour.closeHour.toString().padStart(2, '0')}:${hour.closeMinute.toString().padStart(2, '0')}`;
            console.log(`  ${dayNames}: ${start} - ${end}`);
          });
        });
      } else {
        console.log('  ❌ No open hours configured');
      }
      
      // CRITICAL: Availability Blocks Analysis
      console.log('\n🚨 AVAILABILITY BLOCKS (CRITICAL):');
      if (calendar.availabilities && calendar.availabilities.length > 0) {
        console.log(`  ✅ Found ${calendar.availabilities.length} availability blocks`);
        calendar.availabilities.forEach((availability, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(availability, null, 4)}`);
        });
      } else {
        console.log('  ❌ NO AVAILABILITY BLOCKS CONFIGURED!');
        console.log('  🚨 THIS IS THE PROBLEM!');
      }
      
      // Booking Window Analysis
      console.log('\n📅 BOOKING WINDOW:');
      console.log(`  Allow booking after: ${calendar.allowBookingAfter} ${calendar.allowBookingAfterUnit}`);
      console.log(`  Allow booking for: ${calendar.allowBookingFor} ${calendar.allowBookingForUnit}`);
      
      // Look Busy Configuration
      console.log('\n👀 LOOK BUSY CONFIG:');
      if (calendar.lookBusyConfig && calendar.lookBusyConfig.enabled) {
        console.log(`  ⚠️  Look Busy ENABLED at ${calendar.lookBusyConfig.lookBusyPercentage}%`);
        if (calendar.lookBusyConfig.lookBusyPercentage > 50) {
          console.log('  🚨 High Look Busy percentage may hide available slots!');
        }
      } else {
        console.log('  ✅ Look Busy disabled');
      }
      
    } else {
      console.log('❌ Could not retrieve calendar details');
    }
    
    console.log('\n═'.repeat(80));
    console.log('🔧 DIAGNOSTIC RESULTS');
    console.log('═'.repeat(80));
    
    console.log(`🔢 Raw slots found: ${result.slots ? result.slots.length : 0}`);
    console.log(`📊 Result source: ${result.source || 'unknown'}`);
    
    if (result.warning) {
      console.log(`⚠️  Warning: ${result.warning}`);
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
    console.log('\n═'.repeat(80));
    console.log('💡 SOLUTION STEPS');
    console.log('═'.repeat(80));
    
    if (result.calendarDetails && result.calendarDetails.calendar) {
      const calendar = result.calendarDetails.calendar;
      
      if (!calendar.availabilities || calendar.availabilities.length === 0) {
        console.log('🎯 TO FIX THE 0 SLOTS ISSUE:');
        console.log('');
        console.log('1. 📱 Log into your GHL Dashboard');
        console.log('2. 🗓️  Go to Calendar Settings');
        console.log(`3. 🔍 Find calendar: "${calendar.name}" (ID: ${calendar.id})`);
        console.log('4. 👥 Go to Team Member settings');
        console.log('5. ⚡ ADD AVAILABILITY BLOCKS for your team member');
        console.log('6. 📅 Set specific days/times when appointments can be booked');
        console.log('7. 💾 Save the configuration');
        console.log('8. 🧪 Test this script again');
        console.log('');
        console.log('🚨 CRITICAL: Open Hours ≠ Availability Blocks');
        console.log('   Open Hours = When calendar CAN be used');
        console.log('   Availability Blocks = When team members ARE available');
        console.log('   Both are required for slots to appear!');
      }
      
      if (!calendar.isActive) {
        console.log('\n📢 ALSO: Activate the calendar in GHL dashboard');
      }
      
      if (!calendar.teamMembers || calendar.teamMembers.length === 0) {
        console.log('\n👥 ALSO: Assign team members to the calendar');
      }
      
      if (calendar.lookBusyConfig && calendar.lookBusyConfig.enabled && calendar.lookBusyConfig.lookBusyPercentage > 50) {
        console.log('\n👀 ALSO: Consider reducing Look Busy percentage');
      }
    }
    
    console.log('\n✅ Diagnostic completed!');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

diagnoseGHLCalendar(); 