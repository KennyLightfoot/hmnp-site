/**
 * Test Booking Page - Houston Mobile Notary Pros
 * Testing our fixed BookingForm with step validation
 */

import { Metadata } from 'next';
import BookingForm from '@/components/booking/BookingForm';

export const metadata: Metadata = {
  title: 'Test Booking Form | Houston Mobile Notary Pros',
  description: 'Testing our fixed booking form with proper step validation'
};

export default function TestBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 TEST: Fixed BookingForm
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Testing our step validation fix - Continue button should work properly
          </p>
          
          {/* Test Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Test Instructions:</h3>
            <ol className="text-sm text-blue-800 text-left max-w-md mx-auto">
              <li>1. Select a service and click Continue</li>
              <li>2. Should proceed to next step (not get stuck)</li>
              <li>3. Try continuing without filling required fields</li>
              <li>4. Should only validate current step fields</li>
              <li>5. Complete each step to test full flow</li>
            </ol>
          </div>
        </div>

        {/* Fixed BookingForm */}
        <BookingForm
          initialData={{
            serviceType: 'STANDARD_NOTARY',
          }}
        />
        
        {/* Test Status */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🎯 What Was Fixed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 p-4 rounded-lg">
                <strong className="text-red-800">❌ Before (Broken):</strong><br />
                <span className="text-red-600">
                  form.trigger() validated ALL form fields<br />
                  Continue button stuck disabled<br />
                  Users couldn't progress past first step
                </span>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <strong className="text-green-800">✅ After (Fixed):</strong><br />
                <span className="text-green-600">
                  Only validates current step fields<br />
                  Continue button works properly<br />
                  Users can complete the booking flow
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 