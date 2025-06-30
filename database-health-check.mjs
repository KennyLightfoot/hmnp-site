import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  console.log('🔍 PHASE 2: DATABASE INTEGRITY VERIFICATION\n');

  try {
    // Test basic connectivity
    console.log('📡 Testing database connectivity...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Check critical table counts
    console.log('📊 Checking table populations...');
    const tables = {
      services: await prisma.service.count(),
      users: await prisma.user.count(),
      bookings: await prisma.booking.count(),
      payments: await prisma.payment.count(),
      securityAuditLog: await prisma.securityAuditLog.count(),
      promoCodeUsage: await prisma.promoCodeUsage.count(),
      stripeWebhookLog: await prisma.stripeWebhookLog.count(),
    };

    Object.entries(tables).forEach(([table, count]) => {
      const status = count > 0 ? '✅' : (table === 'securityAuditLog' || table === 'promoCodeUsage' || table === 'stripeWebhookLog' ? '⚠️' : '❌');
      console.log(`${status} ${table}: ${count} records`);
    });

    // Check for active services
    console.log('\n🔧 Checking service configuration...');
    const activeServices = await prisma.service.findMany({
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        serviceType: true, 
        basePrice: true,
        requiresDeposit: true,
        depositAmount: true
      }
    });

    console.log(`Found ${activeServices.length} active services:`);
    activeServices.forEach(service => {
      console.log(`  - ${service.name} (${service.serviceType}): $${service.basePrice}`);
    });

    // Check SOP compliance
    console.log('\n📋 Checking SOP compliance...');
    const standardNotary = activeServices.find(s => 
      s.serviceType === 'STANDARD_NOTARY' && s.basePrice.toNumber() === 75
    );
    const extendedHours = activeServices.find(s => 
      s.serviceType === 'EXTENDED_HOURS_NOTARY' && s.basePrice.toNumber() === 100
    );
    const loanSigning = activeServices.find(s => 
      s.serviceType === 'LOAN_SIGNING_SPECIALIST' && s.basePrice.toNumber() === 150
    );

    console.log(`${standardNotary ? '✅' : '❌'} Standard Notary ($75): ${standardNotary ? 'FOUND' : 'MISSING'}`);
    console.log(`${extendedHours ? '✅' : '❌'} Extended Hours ($100): ${extendedHours ? 'FOUND' : 'MISSING'}`);
    console.log(`${loanSigning ? '✅' : '❌'} Loan Signing ($150): ${loanSigning ? 'FOUND' : 'MISSING'}`);

    // Check business settings
    console.log('\n⚙️ Checking business settings...');
    const businessSettings = await prisma.businessSettings.count({
      where: { category: 'booking' }
    });
    console.log(`${businessSettings > 0 ? '✅' : '❌'} Business settings configured: ${businessSettings} settings`);

    // Check recent security additions
    console.log('\n🛡️ Checking security infrastructure...');
    const bookingsWithSecurity = await prisma.booking.count({
      where: { securityFlags: { not: null } }
    });
    console.log(`📊 Bookings with security flags: ${bookingsWithSecurity}`);
    console.log(`📝 Security audit entries: ${tables.securityAuditLog}`);
    console.log(`🎫 Promo code usage records: ${tables.promoCodeUsage}`);

    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    const recommendations = [];
    
    if (tables.services === 0) {
      recommendations.push('❗ CRITICAL: No services found - run database seeding immediately');
    }
    if (!standardNotary || !extendedHours || !loanSigning) {
      recommendations.push('❗ CRITICAL: Missing SOP-compliant services - run service setup script');
    }
    if (tables.users === 0) {
      recommendations.push('⚠️ WARNING: No users found - create admin user');
    }
    if (businessSettings === 0) {
      recommendations.push('⚠️ WARNING: No booking settings - configure business hours');
    }
    if (tables.securityAuditLog === 0) {
      recommendations.push('ℹ️ INFO: No security events logged yet (normal for new system)');
    }

    if (recommendations.length === 0) {
      console.log('✅ All checks passed - database is healthy!');
    } else {
      recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    return {
      healthy: recommendations.filter(r => r.includes('CRITICAL')).length === 0,
      tables,
      activeServices: activeServices.length,
      sopCompliant: !!(standardNotary && extendedHours && loanSigning),
      recommendations
    };

  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return { healthy: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth()
  .then(result => {
    console.log('\n📊 HEALTH CHECK SUMMARY:');
    console.log(`Status: ${result.healthy ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    process.exit(result.healthy ? 0 : 1);
  })
  .catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });