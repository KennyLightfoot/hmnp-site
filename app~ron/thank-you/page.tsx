import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RON Session Completed | Houston Mobile Notary Pros',
  description: 'Thank you for completing your Remote Online Notarization session with Houston Mobile Notary Pros.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RONThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="max-w-lg w-full bg-white p-8 md:p-12 rounded-lg shadow-lg text-center border border-gray-200">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#002147] mb-4">RON Session Completed!</h1>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for completing your remote online notarization session.
        </p>
        <p className="text-md text-gray-600 mb-8">
          You can download your notarized documents from your dashboard at any time. A confirmation email with your documents and receipt has been sent to you.
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/ron/dashboard" className="inline-block bg-[#A52A2A] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#8B0000] transition duration-300">
            Go to RON Dashboard
          </Link>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 