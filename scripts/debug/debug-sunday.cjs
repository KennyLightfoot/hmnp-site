const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSunday() {
  try {
    const date = '2025-06-29'; // Sunday
    
    // Get business settings
    const businessSettingsRecords = await prisma.businessSettings.findMany();
    const businessSettings = {};
    businessSettingsRecords.forEach(setting => {
      businessSettings[setting.key] = setting.value;
    });
    
    const testDate = new Date(date + 'T12:00:00.000Z');
    const dayOfWeek = testDate.getDay(); // Should be 0 for Sunday
    console.log('Date:', date);
    console.log('Day of week:', dayOfWeek, '(Sunday)');
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    const startTimeKey = `business_hours_${dayName}_start`;
    const endTimeKey = `business_hours_${dayName}_end`;
    
    console.log('Looking for keys:', startTimeKey, endTimeKey);
    console.log('Start time:', businessSettings[startTimeKey]);
    console.log('End time:', businessSettings[endTimeKey]);
    
    // Check all Sunday related keys
    console.log('\nAll Sunday keys in database:');
    Object.keys(businessSettings).filter(key => key.includes('sunday')).forEach(key => {
      console.log('-', key, ':', businessSettings[key]);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    await prisma.$disconnect();
  }
}

debugSunday();