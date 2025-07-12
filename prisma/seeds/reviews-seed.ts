import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 🎯 Review Seed Data - Phase 4 Testing
 * Houston Mobile Notary Pros - Sample reviews for schema markup testing
 */

const sampleReviews = [
  {
    reviewerName: "Sarah Johnson",
    reviewerEmail: "sarah.j@example.com",
    rating: 5,
    reviewText: "Absolutely fantastic service! The notary arrived exactly on time and was extremely professional. The entire process was smooth and efficient. I'll definitely use Houston Mobile Notary Pros again for all my notarization needs.",
    serviceType: "Standard Notary",
    platform: "internal",
    isVerified: true,
    isFeatured: true,
    helpfulCount: 12,
    responseText: "Thank you so much for the kind words, Sarah! We're thrilled that you had such a positive experience with our service. We look forward to serving you again!",
    responseDate: new Date('2024-01-15T10:30:00Z')
  },
  {
    reviewerName: "Michael Chen",
    reviewerEmail: "m.chen@example.com", 
    rating: 5,
    reviewText: "Had to get loan documents notarized last minute for a house closing. The team was incredibly responsive and managed to fit me in same day. The notary was knowledgeable about real estate documents and caught a potential issue before we signed. Saved me from major headaches!",
    serviceType: "Loan Signing Specialist",
    platform: "internal",
    isVerified: true,
    isFeatured: true,
    helpfulCount: 8,
    responseText: "We're so glad we could help with your closing, Michael! Our loan signing specialists are trained to catch these types of issues. Congratulations on your new home!"
  },
  {
    reviewerName: "Lisa Rodriguez",
    reviewerEmail: "lisa.r@example.com",
    rating: 5,
    reviewText: "Amazing service during a difficult time. My elderly father needed documents notarized but couldn't travel. The notary came to the hospital and was incredibly patient and compassionate. They made sure everything was handled correctly while being respectful of our family situation.",
    serviceType: "Extended Hours Notary",
    platform: "internal",
    isVerified: true,
    isFeatured: true,
    helpfulCount: 15,
    responseText: "Thank you for trusting us during such an important time, Lisa. We're honored to have been able to help your family when you needed it most."
  },
  {
    reviewerName: "David Wilson",
    reviewerEmail: "d.wilson@example.com",
    rating: 5,
    reviewText: "Outstanding RON service! The remote notarization process was seamless and secure. The technology worked perfectly and the notary walked me through every step. Much more convenient than driving across town, especially for business documents.",
    serviceType: "Remote Online Notarization",
    platform: "internal",
    isVerified: true,
    isFeatured: false,
    helpfulCount: 6,
    responseText: "We're delighted that our RON service met your expectations, David! We're continuously improving our technology to make the process as smooth as possible."
  },
  {
    reviewerName: "Amanda Foster",
    reviewerEmail: "amanda.f@example.com",
    rating: 4,
    reviewText: "Great service overall. The notary was professional and efficient. Only minor issue was they arrived about 10 minutes late, but they called ahead to let me know. The actual notarization was quick and done perfectly.",
    serviceType: "Standard Notary",
    platform: "internal",
    isVerified: true,
    isFeatured: false,
    helpfulCount: 3,
    responseText: "Thank you for the feedback, Amanda! We apologize for the delay and appreciate you noting that we called ahead. We're always working to improve our punctuality."
  },
  {
    reviewerName: "Robert Martinez",
    rating: 5,
    reviewText: "Exceptional emergency service! Called them at 8 PM on a Sunday for urgent business documents that needed to be notarized before Monday morning. They had someone at my office within 2 hours. True professionals who understand the urgency of business needs.",
    serviceType: "Emergency Notary",
    platform: "google",
    externalId: "google_review_12345",
    externalUrl: "https://www.google.com/maps/reviews/12345",
    isVerified: false,
    isFeatured: true,
    helpfulCount: 9
  },
  {
    reviewerName: "Jennifer Thompson",
    rating: 5,
    reviewText: "Used their services for estate planning documents. The notary was very knowledgeable about the requirements and helped ensure everything was properly executed. They even provided guidance on document storage and future needs. Highly recommend!",
    serviceType: "Estate Planning",
    platform: "yelp",
    externalId: "yelp_review_67890",
    externalUrl: "https://www.yelp.com/biz/houston-mobile-notary-pros/review/67890",
    isVerified: false,
    isFeatured: false,
    helpfulCount: 4
  },
  {
    reviewerName: "Carlos Mendoza",
    rating: 5,
    reviewText: "Perfect service for our business needs. We have multiple locations and they were able to coordinate notarizations across all our sites on the same day. Very organized and professional team. The pricing was fair and transparent.",
    serviceType: "Business Solutions",
    platform: "internal",
    isVerified: true,
    isFeatured: false,
    helpfulCount: 2,
    responseText: "Thank you for choosing us for your multi-location needs, Carlos! We pride ourselves on being able to handle complex business requirements efficiently."
  },
  {
    reviewerName: "Rebecca Adams",
    rating: 4,
    reviewText: "Good experience overall. The notary was friendly and professional. The process was explained clearly and completed quickly. Would use again for future notarization needs.",
    serviceType: "Standard Notary", 
    platform: "internal",
    isVerified: true,
    isFeatured: false,
    helpfulCount: 1
  },
  {
    reviewerName: "James Patterson",
    rating: 5,
    reviewText: "Impressed by their attention to detail and professionalism. Used them for loan documents and they caught several areas that needed clarification before signing. Their expertise prevented potential problems with the lender. Absolutely worth the investment.",
    serviceType: "Loan Signing Specialist",
    platform: "google",
    externalId: "google_review_54321",
    externalUrl: "https://www.google.com/maps/reviews/54321",
    isVerified: false,
    isFeatured: true,
    helpfulCount: 7
  }
];

export async function seedReviews() {
  console.log('🌱 Seeding reviews...');

  // Clear existing reviews (for development only)
  await prisma.review.deleteMany({});

  // Create reviews with proper timestamps
  for (const [index, reviewData] of sampleReviews.entries()) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (30 - index * 3)); // Spread over last 30 days

    await prisma.review.create({
      data: {
        ...reviewData,
        createdAt,
        updatedAt: createdAt,
        responseDate: reviewData.responseText ? createdAt : null
      }
    });
  }

  console.log(`✅ Created ${sampleReviews.length} sample reviews`);

  // Log aggregate statistics
  const stats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true }
  });

  console.log(`📊 Average rating: ${stats._avg.rating?.toFixed(1)}`);
  console.log(`📈 Total reviews: ${stats._count.rating}`);
} 