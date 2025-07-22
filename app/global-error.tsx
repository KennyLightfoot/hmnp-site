"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
      <div className="mb-6 text-red-600">
        <AlertTriangle size={64} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Something went wrong!
      </h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        We apologize for the inconvenience. This appears to be a system error.
        Please try again or contact us if the problem persists.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={reset} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="border-gray-300 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Home size={20} />
          Return to home
        </Button>
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md">
        <p className="text-sm text-gray-500">
          If this problem continues, please contact our support team at{' '}
          <a href="mailto:support@houstonmobilenotarypros.com" className="text-blue-600 hover:underline">
            support@houstonmobilenotarypros.com
          </a>
        </p>
      </div>
    </div>
  );
} 