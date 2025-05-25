const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickCheck() {
  try {
    console.log('🔍 Quick Database Assessment...\n');

    // Check basic counts
    const tables = [
      { name: 'Session', model: prisma.session },
      { name: 'VerificationToken', model: prisma.verificationToken },
      { name: 'BackgroundError', model: prisma.backgroundError },
      { name: 'NotificationLog', model: prisma.notificationLog },
      { name: 'DownloadLog', model: prisma.downloadLog },
      { name: 'Booking', model: prisma.booking },
      { name: 'Assignment', model: prisma.assignment },
      { name: 'User', model: prisma.user }
    ];

    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`${table.name.padEnd(20)} ${count.toLocaleString()} rows`);
      } catch (e) {
        console.log(`${table.name.padEnd(20)} Error counting`);
      }
    }

    // Check for cleanup opportunities
    console.log('\n🧹 Cleanup Opportunities:');
    
    const expiredSessions = await prisma.session.count({
      where: { expires: { lt: new Date() } }
    });
    console.log(`• ${expiredSessions} expired sessions can be deleted`);

    const expiredTokens = await prisma.verificationToken.count({
      where: { expires: { lt: new Date() } }
    });
    console.log(`• ${expiredTokens} expired verification tokens can be deleted`);

    const oldErrors = await prisma.backgroundError.count({
      where: { 
        createdAt: { 
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        } 
      }
    });
    console.log(`• ${oldErrors} background errors older than 30 days`);

    const oldLogs = await prisma.notificationLog.count({
      where: { 
        sentAt: { 
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
        } 
      }
    });
    console.log(`• ${oldLogs} notification logs older than 90 days`);

    console.log('\n💡 Recommendations:');
    if (expiredSessions + expiredTokens + oldErrors + oldLogs > 0) {
      console.log('- Run cleanup script: node scripts/cleanup-database.js --confirm');
    }
    console.log('- Check Neon dashboard for current storage usage');
    console.log('- Consider upgrading to Launch plan ($19/mo for 10GB)');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck(); 