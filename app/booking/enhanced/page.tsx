/**
 * Enhanced Booking Page - Houston Mobile Notary Pros
 * Advanced booking form with enhanced features and better UX
 */

import { Metadata } from 'next';
import BookingForm from '@/components/booking/BookingForm';

export const metadata: Metadata = {
  title: 'Enhanced Booking | Houston Mobile Notary Pros',
  description: 'Advanced booking system with real-time pricing, AI assistance, and enhanced scheduling options.',
  keywords: 'Houston notary booking, mobile notary appointment, enhanced booking, AI booking assistant'
};

export default function EnhancedBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Enhanced Booking Experience
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Our most advanced booking system with AI assistance, real-time pricing, 
            and intelligent scheduling recommendations.
          </p>
          
          {/* Enhanced Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-blue-600 text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Assistant</h3>
              <p className="text-sm text-gray-600">Get intelligent recommendations and instant answers</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-green-600 text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Real-time Pricing</h3>
              <p className="text-sm text-gray-600">See exact costs with no hidden fees</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-purple-600 text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-800 mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">AI-powered availability recommendations</p>
            </div>
          </div>
        </div>

        {/* Enhanced Booking Form */}
        <div className="max-w-4xl mx-auto">
          <BookingForm />
        </div>
        
        {/* Enhanced Trust Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Why Choose Our Enhanced Booking?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">🔒</span>
                </div>
                <strong className="text-gray-800 block mb-1">Secure & Encrypted</strong>
                <span className="text-gray-600">Bank-level security for all transactions</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">⚡</span>
                </div>
                <strong className="text-gray-800 block mb-1">Instant Confirmation</strong>
                <span className="text-gray-600">Get confirmed within seconds</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">🎯</span>
                </div>
                <strong className="text-gray-800 block mb-1">AI-Powered</strong>
                <span className="text-gray-600">Intelligent recommendations</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 text-xl">📱</span>
                </div>
                <strong className="text-gray-800 block mb-1">Mobile Optimized</strong>
                <span className="text-gray-600">Perfect experience on any device</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 