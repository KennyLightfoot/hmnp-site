import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Message Sent | Houston Mobile Notary Pros",
  description: "Thank you for contacting Houston Mobile Notary Pros. We will respond shortly.",
  robots: { // Prevent search engines from indexing this page
    index: false,
    follow: false,
  },
};

export default function ContactThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="max-w-lg w-full bg-white p-8 md:p-12 rounded-lg shadow-lg text-center border border-gray-200">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#002147] mb-4">Thank You!</h1>
        <p className="text-lg text-gray-700 mb-8">
          Your message has been successfully sent. We appreciate you contacting us and will get back to you as soon as possible, typically within 2 business hours.
        </p>
        <Link href="/">
          <span className="inline-block bg-[#A52A2A] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#8B0000] transition duration-300">
            Return to Homepage
          </span>
        </Link>
      </div>
    </div>
  );
} 