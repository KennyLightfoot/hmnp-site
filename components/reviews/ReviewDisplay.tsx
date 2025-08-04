'use client';

/**
 * Review Display Component
 * Houston Mobile Notary Pros - Phase 4 SEO Enhancement
 * 
 * Displays individual reviews with star ratings and schema markup
 * for enhanced search engine visibility and rich snippets.
 */

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ExternalLink, Calendar, User } from 'lucide-react';
import IndividualReviewSchema, { formatReviewForSchema, calculateAggregateRating } from '@/components/schema/IndividualReviewSchema';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  serviceType?: string;
  platform?: string;
  externalUrl?: string;
  helpfulCount?: number;
  responseText?: string;
  responseDate?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
}

interface ReviewDisplayProps {
  reviews?: Review[];
  showSchema?: boolean;
  maxReviews?: number;
  featured?: boolean;
  platform?: string;
  minRating?: number;
  showAggregateRating?: boolean;
  showLoadMore?: boolean;
  className?: string;
}

export default function ReviewDisplay({
  reviews: propReviews,
  showSchema = true,
  maxReviews = 10,
  featured = false,
  platform = undefined,
  minRating = undefined,
  showAggregateRating = true,
  showLoadMore = true,
  className = ''
}: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>(propReviews || []);
  const [loading, setLoading] = useState(!propReviews);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [aggregateRating, setAggregateRating] = useState<any>(null);

  // Fetch reviews if not provided as props
  useEffect(() => {
    if (!propReviews) {
      fetchReviews();
    }
  }, [propReviews, featured, platform, minRating]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: maxReviews.toString(),
        includeStats: 'true'
      });

      if (featured) params.append('featured', 'true');
      if (platform) params.append('platform', platform);
      if (minRating) params.append('minRating', minRating.toString());

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setReviews(data.data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.data.reviews]);
        }
        setHasMore(data.data.pagination.hasNext);
        setAggregateRating(data.data.stats);
      } else {
        setError(data.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Review fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchReviews(page + 1);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {rating}.0
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google':
        return '🟦'; // Google icon placeholder
      case 'yelp':
        return '🔴'; // Yelp icon placeholder
      case 'facebook':
        return '🔵'; // Facebook icon placeholder
      default:
        return '⭐'; // Default icon
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">Error loading reviews: {error}</p>
        <button
          onClick={() => fetchReviews()}
          className="mt-4 px-4 py-2 bg-[#A52A2A] text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">No reviews found.</p>
      </div>
    );
  }

  // Format reviews for schema markup
  const formattedReviews = reviews.map(formatReviewForSchema);
  const schemaAggregateRating = aggregateRating || calculateAggregateRating(formattedReviews);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Schema Markup */}
      {showSchema && (
        <IndividualReviewSchema
          reviews={formattedReviews}
          aggregateRating={schemaAggregateRating}
        />
      )}

      {/* Aggregate Rating Summary */}
      {showAggregateRating && aggregateRating && (
        <div className="bg-gradient-to-r from-[#002147] to-blue-900 text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Customer Reviews</h3>
              <div className="flex items-center space-x-4">
                {renderStars(Math.round(aggregateRating.averageRating), 'lg')}
                <span className="text-lg">
                  Based on {aggregateRating.totalReviews} reviews
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {aggregateRating.averageRating.toFixed(1)}
              </div>
              <div className="text-sm opacity-90">out of 5</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-shadow ${
              review.isFeatured ? 'border-[#A52A2A] bg-red-50' : 'border-gray-200'
            }`}
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#002147] to-blue-800 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {review.reviewerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">
                      {review.reviewerName}
                    </h4>
                    {review.isVerified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                    {review.isFeatured && (
                      <span className="bg-[#A52A2A] text-white text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-gray-500 text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Platform and External Link */}
              <div className="flex items-center space-x-2">
                {review.platform && review.platform !== 'internal' && (
                  <span className="text-sm text-gray-500 flex items-center">
                    {getPlatformIcon(review.platform)}
                    <span className="ml-1 capitalize">{review.platform}</span>
                  </span>
                )}
                {review.externalUrl && (
                  <a
                    href={review.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A52A2A] hover:text-red-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Service Type */}
            {review.serviceType && (
              <div className="mb-3">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {review.serviceType}
                </span>
              </div>
            )}

            {/* Review Text */}
            <blockquote className="text-gray-700 leading-relaxed mb-4 italic">
              "{review.reviewText}"
            </blockquote>

            {/* Business Response */}
            {review.responseText && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#002147]">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  Response from Houston Mobile Notary Pros
                  {review.responseDate && (
                    <span className="ml-2">
                      • {formatDate(review.responseDate)}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{review.responseText}</p>
              </div>
            )}

            {/* Helpful Count */}
            {review.helpfulCount && review.helpfulCount > 0 && (
              <div className="flex items-center mt-4 text-sm text-gray-600">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {review.helpfulCount} people found this helpful
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-[#A52A2A] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
} 