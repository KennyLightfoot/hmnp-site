const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Copy the exact function from the API
async function getBusinessHoursForDay(dayOfWeek, businessSettings) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  const startTimeKey = `business_hours_${dayName}_start`;
  const endTimeKey = `business_hours_${dayName}_end`;
  
  const startTime = businessSettings[startTimeKey];
  const endTime = businessSettings[endTimeKey];
  
  console.log('getBusinessHoursForDay debug:');
  console.log('- dayOfWeek:', dayOfWeek);
  console.log('- dayName:', dayName);
  console.log('- startTimeKey:', startTimeKey);
  console.log('- endTimeKey:', endTimeKey);
  console.log('- startTime:', startTime);
  console.log('- endTime:', endTime);
  
  // If no custom hours set, use defaults
  if (!startTime || !endTime) {
    console.log('- No custom hours found, checking defaults...');
    
    const DEFAULT_BUSINESS_HOURS = [
      { startTime: '09:00', endTime: '17:00', dayOfWeek: 1 }, // Monday
      { startTime: '09:00', endTime: '17:00', dayOfWeek: 2 }, // Tuesday
      { startTime: '09:00', endTime: '17:00', dayOfWeek: 3 }, // Wednesday
      { startTime: '09:00', endTime: '17:00', dayOfWeek: 4 }, // Thursday
      { startTime: '09:00', endTime: '17:00', dayOfWeek: 5 }, // Friday
      { startTime: '10:00', endTime: '15:00', dayOfWeek: 6 }, // Saturday (Limited hours)
      // Sunday closed by default
    ];
    
    const defaultHours = DEFAULT_BUSINESS_HOURS.find(h => h.dayOfWeek === dayOfWeek);
    console.log('- defaultHours found:', defaultHours);
    return defaultHours || null;
  }
  
  return {
    startTime,
    endTime,
    dayOfWeek,
  };
}

async function testBusinessHours() {
  try {
    // Get business settings exactly like the API does
    const businessSettingsRecords = await prisma.businessSettings.findMany();
    const businessSettings = {};
    businessSettingsRecords.forEach(setting => {
      businessSettings[setting.key] = setting.value;
    });
    
    console.log('Testing Sunday (day 0):');
    const sundayHours = await getBusinessHoursForDay(0, businessSettings);
    console.log('Result:', sundayHours);
    
    console.log('\nTesting Saturday (day 6):');
    const saturdayHours = await getBusinessHoursForDay(6, businessSettings);
    console.log('Result:', saturdayHours);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

testBusinessHours();