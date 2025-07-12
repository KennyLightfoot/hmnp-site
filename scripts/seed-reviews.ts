#!/usr/bin/env tsx

import { seedReviews } from '../prisma/seeds/reviews-seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting review seed process...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Run the seed
    await seedReviews();
    
    // Verify the seed worked
    const reviewCount = await prisma.review.count();
    console.log(`📈 Total reviews in database: ${reviewCount}`);
    
    if (reviewCount > 0) {
      const sampleReview = await prisma.review.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log('📄 Sample review:', {
        reviewer: sampleReview?.reviewerName,
        rating: sampleReview?.rating,
        platform: sampleReview?.platform
      });
    }
    
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 