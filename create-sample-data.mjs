import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleData() {
  console.log('🎯 Creating comprehensive sample data for Houston Mobile Notary Pros...\n');

  try {
    // Get existing services
    const services = await prisma.service.findMany({
      where: { isActive: true }
    });

    if (services.length === 0) {
      console.log('❌ No services found. Run setup-complete-system.mjs first.');
      return;
    }

    // Get existing promo codes
    const promoCodes = await prisma.promoCode.findMany({
      where: { isActive: true }
    });

    console.log('📋 Available Services:');
    services.forEach(service => {
      console.log(`  - ${service.name} (${service.id}): $${service.basePrice}`);
    });

    console.log('\n🎫 Available Promo Codes:');
    promoCodes.forEach(code => {
      console.log(`  - ${code.code}: ${code.description}`);
    });

    // Sample bookings with different scenarios
    const sampleBookings = [
      {
        // Standard booking - no promo code
        serviceId: services.find(s => s.name === 'Standard Mobile Notary')?.id,
        scheduledDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'CONFIRMED',
        locationType: 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: '123 Main Street',
        addressCity: 'Houston',
        addressState: 'TX',
        addressZip: '77001',
        priceAtBooking: 75.00,
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'Standard notarization for real estate documents',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '(713) 555-0101'
      },
      {
        // Priority booking with PRIORITY20 promo code
        serviceId: services.find(s => s.name === 'Priority Mobile Notary (Rush)')?.id,
        promoCodeId: promoCodes.find(p => p.code === 'PRIORITY20')?.id,
        scheduledDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: 'CONFIRMED',
        locationType: 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: '456 Oak Avenue',
        addressCity: 'Houston',
        addressState: 'TX',
        addressZip: '77002',
        priceAtBooking: 100.00,
        promoCodeDiscount: 20.00,
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'Urgent power of attorney documents',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@email.com',
        customerPhone: '(713) 555-0102'
      },
      {
        // Loan signing with LOANSIGNING15 promo code
        serviceId: services.find(s => s.name === 'Loan Signing Specialist')?.id,
        promoCodeId: promoCodes.find(p => p.code === 'LOANSIGNING15')?.id,
        scheduledDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'CONFIRMED',
        locationType: 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: '789 Pine Street',
        addressCity: 'Katy',
        addressState: 'TX',
        addressZip: '77494',
        priceAtBooking: 150.00,
        promoCodeDiscount: 22.50, // 15% of $150
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'Refinance loan documents - approximately 2 hours',
        customerName: 'Michael Chen',
        customerEmail: 'michael.chen@email.com',
        customerPhone: '(281) 555-0103'
      },
      {
        // Extended hours booking with WELCOME10
        serviceId: services.find(s => s.name === 'Extended Hours Notary')?.id,
        promoCodeId: promoCodes.find(p => p.code === 'WELCOME10')?.id,
        scheduledDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'CONFIRMED',
        locationType: 'PUBLIC_PLACE',
        addressStreet: 'Starbucks - 1001 Memorial Drive',
        addressCity: 'Houston',
        addressState: 'TX',
        addressZip: '77024',
        priceAtBooking: 100.00,
        promoCodeDiscount: 10.00, // 10% of $100
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'Evening appointment for contract signing',
        customerName: 'Emma Davis',
        customerEmail: 'emma.davis@email.com',
        customerPhone: '(713) 555-0104'
      },
      {
        // Payment pending booking (realistic scenario)
        serviceId: services.find(s => s.name === 'Standard Mobile Notary')?.id,
        promoCodeId: promoCodes.find(p => p.code === 'SAVE25')?.id,
        scheduledDateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'PAYMENT_PENDING',
        locationType: 'OUR_OFFICE',
        priceAtBooking: 75.00,
        promoCodeDiscount: 0.00, // SAVE25 requires $100 minimum, so no discount
        depositAmount: 25.00,
        depositStatus: 'PENDING',
        notes: 'Client needs to complete payment',
        customerName: 'Robert Wilson',
        customerEmail: 'robert.wilson@email.com',
        customerPhone: '(713) 555-0105'
      },
      {
        // Remote online notarization
        serviceId: services.find(s => s.name === 'Standard Mobile Notary')?.id,
        scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'SCHEDULED',
        locationType: 'REMOTE_ONLINE_NOTARIZATION',
        priceAtBooking: 75.00,
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'RON session for out-of-state client',
        customerName: 'Lisa Martinez',
        customerEmail: 'lisa.martinez@email.com',
        customerPhone: '(713) 555-0106'
      },
      {
        // Completed booking (past appointment)
        serviceId: services.find(s => s.name === 'Loan Signing Specialist')?.id,
        scheduledDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        actualEndDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
        status: 'COMPLETED',
        locationType: 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: '321 Elm Drive',
        addressCity: 'Sugar Land',
        addressState: 'TX',
        addressZip: '77478',
        priceAtBooking: 150.00,
        depositAmount: 25.00,
        depositStatus: 'COMPLETED',
        notes: 'Purchase loan documents - completed successfully',
        customerName: 'David Brown',
        customerEmail: 'david.brown@email.com',
        customerPhone: '(281) 555-0107'
      }
    ];

    console.log('\n📝 Creating sample bookings...');
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const booking = sampleBookings[i];
      
      // Create the booking
      const createdBooking = await prisma.booking.create({
        data: {
          serviceId: booking.serviceId,
          promoCodeId: booking.promoCodeId || null,
          scheduledDateTime: booking.scheduledDateTime,
          actualEndDateTime: booking.actualEndDateTime || null,
          status: booking.status,
          locationType: booking.locationType,
          addressStreet: booking.addressStreet || null,
          addressCity: booking.addressCity || null,
          addressState: booking.addressState || null,
          addressZip: booking.addressZip || null,
          priceAtBooking: booking.priceAtBooking,
          promoCodeDiscount: booking.promoCodeDiscount || null,
          depositAmount: booking.depositAmount,
          depositStatus: booking.depositStatus,
          notes: booking.notes,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        }
      });

      // Create corresponding payment record
      if (booking.depositStatus === 'COMPLETED') {
        await prisma.payment.create({
          data: {
            bookingId: createdBooking.id,
            amount: booking.depositAmount,
            status: 'COMPLETED',
            provider: 'STRIPE',
            transactionId: `txn_sample_${Date.now()}_${i}`,
            paymentIntentId: `pi_sample_${Date.now()}_${i}`,
            paidAt: new Date(createdBooking.createdAt.getTime() + 5 * 60 * 1000), // 5 minutes after booking
            notes: 'Sample payment for testing'
          }
        });
      }

      // Create notification logs
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        await prisma.notificationLog.create({
          data: {
            bookingId: createdBooking.id,
            notificationType: 'BOOKING_CONFIRMATION',
            method: 'EMAIL',
            recipientEmail: booking.customerEmail,
            subject: 'Booking Confirmation - Houston Mobile Notary Pros',
            message: `Your appointment is confirmed for ${booking.scheduledDateTime.toLocaleDateString()}`,
            status: 'SENT'
          }
        });
      }

      console.log(`  ✅ Created booking ${i + 1}: ${booking.customerName} - ${booking.status}`);
    }

    // Update promo code usage counts
    console.log('\n🎫 Updating promo code usage statistics...');
    
    const promoUsage = {
      'PRIORITY20': 1,
      'LOANSIGNING15': 1,
      'WELCOME10': 1
    };

    for (const [code, usage] of Object.entries(promoUsage)) {
      await prisma.promoCode.update({
        where: { code },
        data: { usageCount: usage }
      });
    }

    // Verify the data
    console.log('\n🔍 Verifying sample data...');
    
    const totalBookings = await prisma.booking.count();
    const confirmedBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' }
    });
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' }
    });
    const totalPayments = await prisma.payment.count();
    const notifications = await prisma.notificationLog.count();

    console.log('\n🎯 Sample Data Summary:');
    console.log(`  📅 Total Bookings: ${totalBookings}`);
    console.log(`  ✅ Confirmed: ${confirmedBookings}`);
    console.log(`  🎉 Completed: ${completedBookings}`);
    console.log(`  💳 Payments: ${totalPayments}`);
    console.log(`  📧 Notifications: ${notifications}`);

    console.log('\n🚀 Test Scenarios Created:');
    console.log('  1. ✅ Standard booking (no promo)');
    console.log('  2. ⚡ Priority booking with PRIORITY20 promo');
    console.log('  3. 🏠 Loan signing with LOANSIGNING15 promo');
    console.log('  4. 🌙 Extended hours with WELCOME10 promo');
    console.log('  5. ⏳ Payment pending scenario');
    console.log('  6. 💻 Remote online notarization');
    console.log('  7. ✨ Completed appointment (historical)');

    console.log('\n📊 Ready for Testing:');
    console.log('  • Promo code validation scenarios');
    console.log('  • Payment processing workflows');
    console.log('  • Email notification system');
    console.log('  • Calendar availability checks');
    console.log('  • Booking status management');

    console.log('\n🎯 Next: Visit Prisma Studio (http://localhost:5555) to view the data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData(); 