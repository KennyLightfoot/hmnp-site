import { PrismaClient } from '@prisma/client';
import { settingsService } from '../lib/services/settings.js';
import { promoCodeService } from '../lib/services/promo-code.js';

const prisma = new PrismaClient();

async function setupBookingSystem() {
  console.log('🚀 Setting up Houston Mobile Notary Pros booking system...');

  try {
    // Initialize default business settings
    console.log('📅 Initializing business settings...');
    await settingsService.initializeDefaultSettings();
    console.log('✅ Business settings initialized');

    // Create sample promo codes
    console.log('🎫 Creating sample promo codes...');
    await promoCodeService.createCommonPromoCodes();
    console.log('✅ Sample promo codes created');

    // Verify settings
    console.log('🔍 Verifying setup...');
    const bookingSettings = await settingsService.getBookingSettings();
    console.log('📋 Current business settings:', {
      bufferTimeMinutes: bookingSettings.bufferTimeMinutes,
      leadTimeHours: bookingSettings.leadTimeHours,
      advanceBookingDays: bookingSettings.advanceBookingDays,
      timeSlotInterval: bookingSettings.timeSlotInterval
    });

    // List promo codes
    const promoCodes = await promoCodeService.listPromoCodes();
    console.log('🎯 Available promo codes:');
    promoCodes.promoCodes.forEach(code => {
      console.log(`  - ${code.code}: ${code.description} (${code.discountType === 'PERCENTAGE' ? code.discountValue + '%' : '$' + code.discountValue} off)`);
    });

    console.log('\n🎉 Booking system setup complete!');
    console.log('\nNext steps:');
    console.log('1. Visit /booking to test the booking flow');
    console.log('2. Try promo codes: WELCOME10, SAVE25');
    console.log('3. Configure business hours in the admin panel (when ready)');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBookingSystem().catch(console.error);
}

export default setupBookingSystem; 