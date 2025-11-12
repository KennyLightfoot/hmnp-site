import type { Metadata } from "next";
import Link from 'next/link';
import { MailCheck, Home, Users, FileText, MessageCircle } from 'lucide-react'; // Added more relevant icons
import ThankYouGMBClient from './ThankYouGMBClient';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouGMBPage() {
  return (
    <>
      <ThankYouGMBClient />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-xl w-full text-center transform transition-all duration-500 hover:scale-105">
          <MailCheck className="mx-auto h-20 w-20 text-blue-500 mb-6 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Inquiry Sent Successfully!
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            Thank you for reaching out to us via Google! We've received your message and our team will review your inquiry. We aim to respond within one business day.
          </p>
          
          <div className="border-t border-gray-200 my-8"></div>

          <h2 className="text-2xl font-semibold text-gray-700 mb-6">While You Wait:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
            <div className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg text-blue-800 mb-2">About Our Team</h3>
              <p className="text-sm text-gray-600 mb-3">Learn more about our commitment to professional notary services.</p>
              <Link href="/about" legacyBehavior>
                <a className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center">
                  Meet Us <MessageCircle className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg text-blue-800 mb-2">Read Our FAQ</h3>
              <p className="text-sm text-gray-600 mb-3">Find quick answers to common questions about our services.</p>
              <Link href="/faq" legacyBehavior>
                <a className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center">
                  View FAQ <MessageCircle className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>

          <Link href="/" legacyBehavior>
            <a className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <Home className="h-5 w-5 mr-2" /> Return to Homepage
            </a>
          </Link>

          <p className="mt-10 text-xs text-gray-500">
            We appreciate your patience and look forward to assisting you!
          </p>
        </div>
      </div>
    </>
  );
}