'use client';

/**
 * Individual Review Schema Component
 * Houston Mobile Notary Pros - Review Rich Snippets
 * 
 * Generates JSON-LD schema markup for individual reviews to enable
 * star ratings and review snippets in Google search results.
 */

import Script from 'next/script';

interface ReviewData {
  id: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  datePublished: string;
  serviceType?: string;
  verifiedPurchase?: boolean;
  helpful?: number;
  platform?: 'google' | 'internal' | 'yelp' | 'facebook';
}

interface IndividualReviewSchemaProps {
  reviews: ReviewData[];
  businessInfo?: {
    name?: string;
    url?: string;
    image?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export default function IndividualReviewSchema({
  reviews,
  businessInfo = {
    name: 'Houston Mobile Notary Pros',
    url: 'https://houstonmobilenotarypros.com',
    image: 'https://houstonmobilenotarypros.com/og-image.jpg'
  },
  aggregateRating
}: IndividualReviewSchemaProps) {
  
  // Generate individual review schema objects
  const reviewSchemas = reviews.map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.reviewerName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": 5,
      "worstRating": 1
    },
    "reviewBody": review.reviewText,
    "datePublished": review.datePublished,
    "publisher": {
      "@type": "Organization", 
      "name": businessInfo.name
    },
    ...(review.verifiedPurchase && {
      "additionalProperty": {
        "@type": "PropertyValue",
        "name": "verifiedPurchase",
        "value": true
      }
    }),
    ...(review.serviceType && {
      "itemReviewed": {
        "@type": "Service",
        "name": review.serviceType,
        "provider": {
          "@type": "LocalBusiness",
          "name": businessInfo.name,
          "url": businessInfo.url
        }
      }
    }),
    ...(review.helpful && {
      "positiveNotes": `${review.helpful} people found this helpful`
    })
  }));

  // Generate business schema with all reviews
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "additionalType": "NotaryService",
    "name": businessInfo.name,
    "url": businessInfo.url,
    "image": businessInfo.image,
    "review": reviewSchemas,
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": aggregateRating.bestRating || 5,
        "worstRating": aggregateRating.worstRating || 1
      }
    })
  };

  // Generate separate review collection schema for enhanced visibility
  const reviewCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "ReviewCollection", 
    "about": {
      "@type": "LocalBusiness",
      "name": businessInfo.name,
      "url": businessInfo.url
    },
    "review": reviewSchemas,
    "totalReviews": reviews.length,
    "averageRating": aggregateRating?.ratingValue || 0
  };

  return (
    <>
      {/* Main business schema with reviews */}
      <Script
        id="business-reviews-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessSchema, null, 2)
        }}
      />
      
      {/* Enhanced review collection schema */}
      <Script
        id="review-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(reviewCollectionSchema, null, 2)
        }}
      />
    </>
  );
}

// Helper function to format reviews for schema
export function formatReviewForSchema(review: any): ReviewData {
  return {
    id: review.id || review.review_id,
    reviewerName: review.reviewer_name || review.name,
    rating: review.rating,
    reviewText: review.review_text || review.reviewText || review.message,
    datePublished: review.created_at || review.date || review.timestamp || new Date().toISOString(),
    serviceType: review.service_type || review.serviceType,
    verifiedPurchase: review.verified_purchase || false,
    helpful: review.helpful_count || 0,
    platform: review.platform || 'internal'
  };
}

// Helper function to calculate aggregate rating from reviews
export function calculateAggregateRating(reviews: ReviewData[]) {
  if (reviews.length === 0) {
    return {
      ratingValue: 0,
      reviewCount: 0,
      bestRating: 5,
      worstRating: 1
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  return {
    ratingValue: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1
  };
} 