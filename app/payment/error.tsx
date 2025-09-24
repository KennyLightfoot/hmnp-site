'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Payment page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment System Error
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            We encountered an issue while processing your payment. This could be due to a temporary system problem or connectivity issue.
          </p>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Error Details:</h3>
              <p className="text-sm text-gray-600 font-mono">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Recovery Actions */}
          <div className="space-y-4">
            {/* Try Again Button */}
            <button
              onClick={reset}
              className="w-full bg-[#002147] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#003366] transition-colors"
            >
              Try Again
            </button>

            {/* Return to Booking Button */}
            <Link
              href="/booking"
              className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-md font-semibold hover:bg-gray-200 transition-colors inline-block"
            >
              Start New Booking
            </Link>

            {/* Contact Support Link */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                If the problem persists, please contact our support team:
              </p>
              <div className="space-y-2">
                <a
                  href={`tel:${require('@/lib/phone').getBusinessTel()}`}
                  className="block text-[#002147] hover:underline font-medium"
                >
                  📞 (123) 456-7890
                </a>
                <a
                  href="mailto:support@example.com"
                  className="block text-[#002147] hover:underline font-medium"
                >
                  ✉️ support@example.com
                </a>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Common Solutions:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Try using a different browser</li>
              <li>• Disable browser extensions temporarily</li>
              <li>• Ensure JavaScript is enabled</li>
            </ul>
          </div>

          {/* Status Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-700">
                Your booking is safe and hasn't been lost
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}