/**
 * Simple Booking Page - Houston Mobile Notary Pros
 * Back to basics: Clear, functional booking form
 */

import { Metadata } from 'next';
import SimpleBookingForm from '@/components/booking/SimpleBookingForm';

export const metadata: Metadata = {
  title: 'Book Your Notary Appointment | Houston Mobile Notary Pros',
  description: 'Professional mobile notary services in Houston. Book online with instant pricing and same-day availability.',
  keywords: 'Houston notary, mobile notary, document notarization, loan signing, same day notary'
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Book Your Notary Appointment
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Professional mobile notary services in Houston
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700 mb-6">
            <div className="flex items-center space-x-1">
              <span className="text-green-600">✓</span>
              <span>$100K Insured</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">✓</span>
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-600">✓</span>
              <span>Same-Day Available</span>
            </div>
          </div>
        </div>

        {/* Simple Booking Form */}
        <SimpleBookingForm />
        
        {/* Trust Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Why Choose Houston Mobile Notary Pros?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-800">Licensed & Insured</strong><br />
                Texas-licensed notary with $100,000 E&O insurance
              </div>
              <div>
                <strong className="text-gray-800">Proven Experience</strong><br />
                Over 2,000 successful appointments with 4.9/5 rating
              </div>
              <div>
                <strong className="text-gray-800">Secure & Reliable</strong><br />
                SSL encrypted booking with satisfaction guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}