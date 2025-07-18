import { prisma } from '@/lib/prisma';

/**
 * Booking Configuration Audit Script
 * ----------------------------------
 * Validates that Service records and BusinessSettings required for the
 * availability engine are present and sane. Prints a human-readable report
 * and exits with code 1 if critical issues are found (useful for CI).
 *
 * Usage (local):
 *   pnpm ts-node scripts/audit-booking-config.ts
 *
 * Recommended: wire this into CI and a nightly cron.
 */

async function main() {
  const issues: string[] = [];

  // 1. Service checks
  const services = await prisma.service.findMany();

  services.forEach((svc) => {
    if (!svc.isActive) {
      issues.push(`Service inactive: ${svc.name} (${svc.id})`);
    }
    if (!Number.isFinite(svc.durationMinutes) || svc.durationMinutes <= 0) {
      issues.push(`Invalid durationMinutes for ${svc.name}: ${svc.durationMinutes}`);
    }
    if (!svc.basePrice || Number(svc.basePrice) <= 0) {
      issues.push(`Invalid basePrice for ${svc.name}: ${svc.basePrice}`);
    }
  });

  // 2. BusinessSettings checks
  const settingsRows = await prisma.businessSettings.findMany({ where: { category: 'booking' } });
  const settings: Record<string, string> = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));

  const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  weekdayNames.forEach((day) => {
    const start = settings[`business_hours_${day}_start`];
    const end = settings[`business_hours_${day}_end`];
    if (!start || !end) {
      issues.push(`Missing business hours for ${day}`);
    } else if (!/^[0-2]\d:[0-5]\d$/.test(start) || !/^[0-2]\d:[0-5]\d$/.test(end)) {
      issues.push(`Invalid business hours format for ${day}: ${start} – ${end}`);
    }
  });

  const numericSettings: Array<[string, number]> = [
    ['slot_interval_minutes', 30],
    ['buffer_time_minutes', 15],
    ['minimum_lead_time_hours', 2],
  ];
  numericSettings.forEach(([key, def]) => {
    const raw = settings[key];
    const n = raw ? parseInt(raw, 10) : def;
    if (!Number.isFinite(n) || n <= 0) {
      issues.push(`Invalid or missing numeric setting ${key}: ${raw}`);
    }
  });

  // Output report
  if (issues.length === 0) {
    console.log('✅ Booking configuration looks good – no issues found.');
  } else {
    console.error('❌ Booking configuration issues detected:');
    issues.forEach((msg) => console.error('  •', msg));
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error('Unexpected error during audit:', err);
    process.exit(1);
  })
  .finally(async () => {
    // Do not disconnect Prisma in server-less envs, but for scripts it’s fine
    try {
      // eslint-disable-next-line no-process-exit
      await prisma.$disconnect();
    } catch {}
  }); 