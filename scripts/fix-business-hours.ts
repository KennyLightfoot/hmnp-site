import { prisma } from '@/lib/prisma';

/**
 * Fix Business Hours Script
 * -------------------------
 * Ensures all weekday hours are set to SOP defaults and adds Sunday hours.
 */

const DEFAULT_HOURS: Record<string, { start: string; end: string }> = {
  monday: { start: '09:00', end: '17:00' },
  tuesday: { start: '09:00', end: '17:00' },
  wednesday: { start: '09:00', end: '17:00' },
  thursday: { start: '09:00', end: '17:00' },
  friday: { start: '09:00', end: '17:00' },
  saturday: { start: '10:00', end: '15:00' },
  sunday: { start: '10:00', end: '15:00' },
};

async function upsertSetting(key: string, value: string) {
  await prisma.businessSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value, category: 'booking' },
  });
}

async function main() {
  const tasks: Promise<any>[] = [];
  for (const [day, hours] of Object.entries(DEFAULT_HOURS)) {
    tasks.push(upsertSetting(`business_hours_${day}_start`, hours.start));
    tasks.push(upsertSetting(`business_hours_${day}_end`, hours.end));
  }
  await Promise.all(tasks);
  console.log('✅ Business hours updated to SOP defaults.');
}

main()
  .catch((err) => {
    console.error('Failed to fix business hours:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 