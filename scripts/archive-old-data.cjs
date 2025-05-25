#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function archiveOldData() {
  try {
    console.log('📦 Starting data archival process...\n');

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    let totalArchived = 0;

    // 1. Archive old completed bookings
    console.log('📋 Archiving old completed bookings...');
    const oldBookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          lt: twoYearsAgo
        }
      },
      include: {
        Payment: true,
        NotarizationDocument: true,
        NotificationLog: true
      }
    });

    if (oldBookings.length > 0) {
      console.log(`   Found ${oldBookings.length} bookings to archive`);
      
      // In a real implementation, you would:
      // 1. Export to archive storage (S3, Neon branch, etc.)
      // 2. Verify archive integrity
      // 3. Only then delete from main database
      
      // For now, we'll just log what would be archived
      console.log(`   ⚠️  SIMULATION: Would archive ${oldBookings.length} bookings`);
      console.log(`   📊 Total related payments: ${oldBookings.reduce((sum, b) => sum + b.Payment.length, 0)}`);
      console.log(`   📄 Total related documents: ${oldBookings.reduce((sum, b) => sum + b.NotarizationDocument.length, 0)}`);
      
      totalArchived += oldBookings.length;
    } else {
      console.log('   ✅ No old bookings found to archive');
    }

    // 2. Archive old completed assignments
    console.log('\n📁 Archiving old completed assignments...');
    const oldAssignments = await prisma.assignment.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          lt: twoYearsAgo
        }
      },
      include: {
        documents: true,
        comments: true,
        history: true
      }
    });

    if (oldAssignments.length > 0) {
      console.log(`   Found ${oldAssignments.length} assignments to archive`);
      console.log(`   ⚠️  SIMULATION: Would archive ${oldAssignments.length} assignments`);
      console.log(`   📄 Total related documents: ${oldAssignments.reduce((sum, a) => sum + a.documents.length, 0)}`);
      console.log(`   💬 Total related comments: ${oldAssignments.reduce((sum, a) => sum + a.comments.length, 0)}`);
      
      totalArchived += oldAssignments.length;
    } else {
      console.log('   ✅ No old assignments found to archive');
    }

    // 3. Archive old notification logs
    console.log('\n📢 Archiving old notification logs...');
    const oldNotificationLogs = await prisma.notificationLog.count({
      where: {
        sentAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
        }
      }
    });

    if (oldNotificationLogs > 0) {
      console.log(`   Found ${oldNotificationLogs} notification logs to archive`);
      console.log(`   ⚠️  SIMULATION: Would archive ${oldNotificationLogs} notification logs`);
      totalArchived += oldNotificationLogs;
    } else {
      console.log('   ✅ No old notification logs found to archive');
    }

    // 4. Archive old comments (3+ years)
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    console.log('\n💬 Archiving old comments...');
    const oldComments = await prisma.comment.count({
      where: {
        createdAt: {
          lt: threeYearsAgo
        }
      }
    });

    if (oldComments > 0) {
      console.log(`   Found ${oldComments} comments to archive`);
      console.log(`   ⚠️  SIMULATION: Would archive ${oldComments} comments`);
      totalArchived += oldComments;
    } else {
      console.log('   ✅ No old comments found to archive');
    }

    console.log('\n🎉 Archive Summary:');
    console.log('=' .repeat(50));
    console.log(`Total records identified for archival: ${totalArchived.toLocaleString()}`);
    
    if (totalArchived === 0) {
      console.log('✨ No data needs archiving at this time!');
    } else {
      console.log('⚠️  SIMULATION MODE: No data was actually moved');
      console.log('\n📋 To implement real archival:');
      console.log('1. Set up archive storage (Neon branch, S3, etc.)');
      console.log('2. Implement export/import functions');
      console.log('3. Add integrity verification');
      console.log('4. Remove simulation mode');
      console.log('\n💡 Next steps:');
      console.log('- Review archived data access requirements');
      console.log('- Set up archive storage infrastructure');
      console.log('- Test archive/restore procedures');
    }

  } catch (error) {
    console.error('❌ Error during archival process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ask for confirmation before running
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  archiveOldData();
} else {
  console.log('📦 Data Archive Tool');
  console.log('=' .repeat(50));
  console.log('This will identify data for archival:');
  console.log('• Completed bookings older than 2 years');
  console.log('• Completed assignments older than 2 years');
  console.log('• Notification logs older than 90 days');
  console.log('• Comments older than 3 years');
  console.log('');
  console.log('Currently in SIMULATION mode - no data will be moved');
  console.log('To proceed, run: node scripts/archive-old-data.cjs --confirm');
} 