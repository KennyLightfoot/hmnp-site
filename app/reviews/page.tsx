import React from 'react';
import { Metadata } from 'next';
import ReviewDisplay from '@/components/reviews/ReviewDisplay';
import { ReviewForm } from '@/components/review-form';
import { Star, Award, Users, TrendingUp } from 'lucide-react';

/**
 * 🎯 Reviews Page - Phase 4 SEO Enhancement
 * Houston Mobile Notary Pros - Customer Reviews & Rich Snippets
 * 
 * Displays customer reviews with individual schema markup for enhanced
 * search engine visibility and star ratings in search results.
 */

export const metadata: Metadata = {
  title: 'Customer Reviews - Houston Mobile Notary Pros | 5-Star Rated Service',
  description: 'Read verified customer reviews for Houston Mobile Notary Pros. See why we\'re the #1 rated mobile notary service in Houston with 4.9/5 stars from over 150+ happy customers.',
  keywords: 'Houston mobile notary reviews, customer testimonials, 5 star notary service, best notary Houston, verified reviews',
  openGraph: {
    title: 'Customer Reviews - Houston Mobile Notary Pros',
    description: 'Read verified customer reviews and see why we\'re Houston\'s #1 rated mobile notary service.',
    type: 'website',
    images: [
      {
        url: '/og-reviews.jpg',
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros Customer Reviews'
      }
    ]
  },
  alternates: {
    canonical: 'https://houstonmobilenotarypros.com/reviews'
  }
};

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#002147] to-blue-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Customer Reviews & Testimonials
            </h1>
            <p className="text-xl mb-8 opacity-90">
              See why thousands of Houston area residents trust us with their most important documents
            </p>
            
            {/* Review Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Star className="h-8 w-8 text-yellow-400 fill-current" />
                </div>
                <div className="text-3xl font-bold mb-2">4.9/5</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-sm opacity-90">Happy Customers</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Award className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-sm opacity-90">Satisfaction Rate</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex justify-center mb-3">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-3xl font-bold mb-2">24hr</div>
                <div className="text-sm opacity-90">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Reviews Display - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Our Customers Say
                </h2>
                <p className="text-gray-600 text-lg">
                  Real reviews from real customers who have experienced our professional notary services.
                </p>
              </div>

              {/* Featured Reviews Section */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
                  Featured Reviews
                </h3>
                <ReviewDisplay
                  featured={true}
                  maxReviews={5}
                  showSchema={true}
                  showAggregateRating={false}
                  showLoadMore={false}
                  className="mb-8"
                />
              </div>

              {/* All Reviews Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  All Customer Reviews
                </h3>
                <ReviewDisplay
                  maxReviews={20}
                  showSchema={false} // Avoid duplicate schema markup
                  showAggregateRating={true}
                  showLoadMore={true}
                />
              </div>
            </div>

            {/* Sidebar - Review Form & Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Leave a Review Section */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Share Your Experience
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Had a great experience with our notary services? We'd love to hear from you!
                  </p>
                  <ReviewForm />
                </div>

                {/* Service Guarantee */}
                <div className="bg-gradient-to-br from-[#A52A2A] to-red-700 text-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4">Our Service Guarantee</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold">Flawless Service</p>
                        <p className="text-sm opacity-90">
                          Perfect execution or we pay the redraw fee
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold">Licensed & Insured</p>
                        <p className="text-sm opacity-90">
                          $100K E&O insurance for your peace of mind
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold">24/7 Availability</p>
                        <p className="text-sm opacity-90">
                          Emergency services available around the clock
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Questions About Our Service?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Speak with our team directly about your notary needs.
                  </p>
                  <div className="space-y-3">
                    <a
                      href={`tel:${require('@/lib/phone').getBusinessTel()}`}
                      className="flex items-center text-[#A52A2A] hover:text-red-700 transition-colors"
                    >
                      <span className="text-lg">📞</span>
                      <span className="ml-2 font-semibold">(832) 617-4285</span>
                    </a>
                    <a
                      href="mailto:contact@houstonmobilenotarypros.com"
                      className="flex items-center text-[#A52A2A] hover:text-red-700 transition-colors"
                    >
                      <span className="text-lg">✉️</span>
                      <span className="ml-2">contact@houstonmobilenotarypros.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#002147] to-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience 5-Star Service?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of satisfied customers who trust Houston Mobile Notary Pros 
            for their most important document notarization needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/booking"
              className="bg-[#A52A2A] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Book Your Service
            </a>
            <a
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors backdrop-blur-sm"
            >
              Get Free Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
