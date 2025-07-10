import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function checkBusinessSettings() {
  console.log('🔍 Checking business settings in database...\n');
  
  try {
    const businessSettings = await prisma.businessSettings.findMany({
      where: { category: 'booking' },
      orderBy: { key: 'asc' }
    });
    
    console.log('📋 BUSINESS SETTINGS SEEDED:');
    console.log('═'.repeat(80));
    
    businessSettings.forEach((setting, index) => {
      console.log(`${index + 1}. ${setting.key}`);
      console.log(`   Value: ${setting.value}`);
      console.log(`   Description: ${setting.description}`);
      console.log('');
    });
    
    console.log('═'.repeat(80));
    console.log(`📊 Total business settings: ${businessSettings.length}`);
    
    // Check if we have all expected settings
    const expectedSettings = [
      'business_hours_monday_start',
      'business_hours_monday_end',
      'business_hours_tuesday_start',
      'business_hours_tuesday_end',
      'business_hours_wednesday_start',
      'business_hours_wednesday_end',
      'business_hours_thursday_start',
      'business_hours_thursday_end',
      'business_hours_friday_start',
      'business_hours_friday_end',
      'business_hours_saturday_start',
      'business_hours_saturday_end',
      'minimum_lead_time_hours',
      'slot_duration_minutes',
      'buffer_time_minutes',
      'timezone'
    ];
    
    const actualSettings = businessSettings.map(s => s.key);
    const missingSettings = expectedSettings.filter(key => !actualSettings.includes(key));
    
    if (missingSettings.length === 0) {
      console.log('✅ SUCCESS: All expected business settings are present!');
    } else {
      console.log('❌ Missing settings:', missingSettings.join(', '));
    }
    
    // Show business hours summary
    console.log('\n🕐 BUSINESS HOURS SUMMARY:');
    console.log('═'.repeat(50));
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    days.forEach(day => {
      const start = businessSettings.find(s => s.key === `business_hours_${day}_start`)?.value;
      const end = businessSettings.find(s => s.key === `business_hours_${day}_end`)?.value;
      if (start && end) {
        console.log(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${start} - ${end}`);
      }
    });
    
    const timezone = businessSettings.find(s => s.key === 'timezone')?.value;
    const leadTime = businessSettings.find(s => s.key === 'minimum_lead_time_hours')?.value;
    const slotDuration = businessSettings.find(s => s.key === 'slot_duration_minutes')?.value;
    const bufferTime = businessSettings.find(s => s.key === 'buffer_time_minutes')?.value;
    
    console.log(`\nTimezone: ${timezone}`);
    console.log(`Minimum lead time: ${leadTime} hours`);
    console.log(`Slot duration: ${slotDuration} minutes`);
    console.log(`Buffer time: ${bufferTime} minutes`);
    
  } catch (error) {
    console.error('❌ Error checking business settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBusinessSettings(); 