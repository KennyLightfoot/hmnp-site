#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n');

    let totalCleaned = 0;

    // 1. Clean up expired sessions
    console.log('🔐 Cleaning expired sessions...');
    const expiredSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    console.log(`   ✅ Deleted ${expiredSessions.count} expired sessions`);
    totalCleaned += expiredSessions.count;

    // 2. Clean up expired verification tokens
    console.log('🎫 Cleaning expired verification tokens...');
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    console.log(`   ✅ Deleted ${expiredTokens.count} expired verification tokens`);
    totalCleaned += expiredTokens.count;

    // 3. Clean up old background errors (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('❌ Cleaning old background errors (30+ days)...');
    const oldErrors = await prisma.backgroundError.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    console.log(`   ✅ Deleted ${oldErrors.count} old background errors`);
    totalCleaned += oldErrors.count;

    // 4. Clean up old download logs (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    console.log('📥 Cleaning old download logs (90+ days)...');
    const oldDownloads = await prisma.downloadLog.deleteMany({
      where: {
        downloadedAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    console.log(`   ✅ Deleted ${oldDownloads.count} old download logs`);
    totalCleaned += oldDownloads.count;

    // 5. Clean up old notification logs (older than 90 days)
    console.log('📢 Cleaning old notification logs (90+ days)...');
    const oldNotifications = await prisma.notificationLog.deleteMany({
      where: {
        sentAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    console.log(`   ✅ Deleted ${oldNotifications.count} old notification logs`);
    totalCleaned += oldNotifications.count;

    // 6. Clean up old invitation tokens (older than 30 days)
    console.log('📧 Cleaning old invitation tokens (30+ days)...');
    const oldInvitations = await prisma.invitationToken.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    console.log(`   ✅ Deleted ${oldInvitations.count} old invitation tokens`);
    totalCleaned += oldInvitations.count;

    // 7. Vacuum database (PostgreSQL specific optimization)
    console.log('🗜️ Running database optimization...');
    try {
      await prisma.$executeRaw`VACUUM ANALYZE;`;
      console.log('   ✅ Database vacuum completed');
    } catch (error) {
      console.log('   ⚠️ Could not run vacuum (requires elevated permissions)');
    }

    console.log('\n🎉 Cleanup Summary:');
    console.log('=' .repeat(50));
    console.log(`Total records cleaned: ${totalCleaned.toLocaleString()}`);
    
    if (totalCleaned === 0) {
      console.log('✨ Your database is already clean!');
    } else {
      console.log('✅ Cleanup completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('- Monitor your Neon dashboard for storage usage');
      console.log('- Consider setting up automated cleanup jobs');
      console.log('- Review data retention policies for your business needs');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ask for confirmation before running
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  cleanupDatabase();
} else {
  console.log('🧹 Database Cleanup Tool');
  console.log('=' .repeat(50));
  console.log('This will delete:');
  console.log('• Expired sessions and verification tokens');
  console.log('• Background errors older than 30 days');
  console.log('• Download logs older than 90 days');
  console.log('• Notification logs older than 90 days');
  console.log('• Invitation tokens older than 30 days');
  console.log('');
  console.log('To proceed, run: node scripts/cleanup-database.js --confirm');
} 