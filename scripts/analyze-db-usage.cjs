#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeDatabase() {
  try {
    console.log('📊 Analyzing database storage usage...\n');

    // Get row counts for each table
    const tables = [
      'User', 'Account', 'Session', 'VerificationToken', 'Assignment', 
      'AssignmentDocument', 'StatusHistory', 'Comment', 'BackgroundError',
      'DownloadLog', 'Service', 'Booking', 'InvitationToken', 
      'NotarizationDocument', 'Payment', 'NotificationLog'
    ];

    console.log('📋 ROW COUNTS BY TABLE:');
    console.log('=' .repeat(50));

    const rowCounts = {};
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        rowCounts[table] = parseInt(count[0].count);
        console.log(`${table.padEnd(25)} ${rowCounts[table].toLocaleString().padStart(10)} rows`);
      } catch (error) {
        console.log(`${table.padEnd(25)} ${'ERROR'.padStart(10)}`);
      }
    }

    // Identify largest tables
    console.log('\n🔍 LARGEST TABLES BY ROW COUNT:');
    console.log('=' .repeat(50));
    const sortedTables = Object.entries(rowCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    sortedTables.forEach(([table, count], index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${table.padEnd(25)} ${count.toLocaleString()} rows`);
    });

    // Check for old data that could be cleaned up
    console.log('\n🗑️ POTENTIAL CLEANUP OPPORTUNITIES:');
    console.log('=' .repeat(50));

    // Check for old sessions
    const oldSessions = await prisma.session.count({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    if (oldSessions > 0) {
      console.log(`• ${oldSessions} expired sessions can be deleted`);
    }

    // Check for old verification tokens
    const oldTokens = await prisma.verificationToken.count({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
    if (oldTokens > 0) {
      console.log(`• ${oldTokens} expired verification tokens can be deleted`);
    }

    // Check for old background errors (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldErrors = await prisma.backgroundError.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    if (oldErrors > 0) {
      console.log(`• ${oldErrors} background errors older than 30 days can be deleted`);
    }

    // Check for old download logs (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldDownloads = await prisma.downloadLog.count({
      where: {
        downloadedAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    if (oldDownloads > 0) {
      console.log(`• ${oldDownloads} download logs older than 90 days can be deleted`);
    }

    // Check for old notification logs (older than 90 days)
    const oldNotifications = await prisma.notificationLog.count({
      where: {
        sentAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    if (oldNotifications > 0) {
      console.log(`• ${oldNotifications} notification logs older than 90 days can be deleted`);
    }

    // Check database size information
    console.log('\n💾 DATABASE SIZE INFORMATION:');
    console.log('=' .repeat(50));
    
    try {
      const dbSize = await prisma.$queryRaw`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as size_bytes;
      `;
      console.log(`Database size: ${dbSize[0].size}`);
      
      // Get table sizes
      const tableSizeInfo = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10;
      `;
      
      console.log('\n📊 LARGEST TABLES BY STORAGE SIZE:');
      tableSizeInfo.forEach((table, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${table.tablename.padEnd(25)} ${table.size}`);
      });
      
    } catch (error) {
      console.log('Could not retrieve database size information');
    }

    console.log('\n✅ Analysis complete!');
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(50));
    console.log('1. Review the cleanup opportunities above');
    console.log('2. Consider archiving old completed bookings and assignments');
    console.log('3. Implement data retention policies for logs');
    console.log('4. Check if any tables have unexpectedly high row counts');
    console.log('5. Consider upgrading your Neon plan if cleanup doesn\'t provide enough space');

  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabase(); 