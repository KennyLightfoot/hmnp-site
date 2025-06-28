// Test timezone conversion issue
const { toZonedTime } = require('date-fns-tz');

function testTimezoneConversion() {
  const date = '2025-06-29'; // Sunday
  const businessTimezone = 'America/Chicago';
  
  console.log('Input date:', date);
  
  // This is what the API is doing
  const requestedDateInClientTz = new Date(`${date}T00:00:00`);
  console.log('requestedDateInClientTz:', requestedDateInClientTz);
  console.log('requestedDateInClientTz day of week:', requestedDateInClientTz.getDay());
  
  const requestedDateInBusinessTz = toZonedTime(requestedDateInClientTz, businessTimezone);
  console.log('requestedDateInBusinessTz:', requestedDateInBusinessTz);
  console.log('requestedDateInBusinessTz day of week:', requestedDateInBusinessTz.getDay());
  
  // Alternative approach
  const directDate = new Date(date + 'T12:00:00.000Z');
  console.log('directDate:', directDate);
  console.log('directDate day of week:', directDate.getDay());
}

testTimezoneConversion();