"use client";

import type { Metadata } from "next";
import { NextPage } from 'next';
import Link from 'next/link';
import { Smile, Home, Newspaper, MessageSquarePlus } from 'lucide-react'; // Added more relevant icons
import { useEffect } from 'react';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const NewsletterThankYouPage: NextPage = () => {
  // Placeholder for analytics event tracking
  useEffect(() => {
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'sign_up', { 'method': 'Newsletter' });
    //   console.log("Analytics: Newsletter Sign_up event tracked.");
    // }
    // if (typeof window !== 'undefined' && window.fbq) {
    //  window.fbq('trackCustom', 'NewsletterSubscription');
    //  console.log("Facebook Pixel: NewsletterSubscription event tracked.");
    // }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-xl w-full text-center transform transition-all duration-500 hover:scale-105">
        <Smile className="mx-auto h-20 w-20 text-green-500 mb-6 animate-bounce" /> {/* Changed animation */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          You're Officially Subscribed!
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Welcome to the Houston Mobile Notary Pros community! Get ready for exclusive insights, updates, and offers delivered straight to your inbox.
        </p>
        
        <div className="border-t border-gray-200 my-8"></div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-6">What's Next?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-teal-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
            <Newspaper className="h-8 w-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-lg text-teal-800 mb-2">Explore Our Blog</h3>
            <p className="text-sm text-gray-600 mb-3">Catch up on our latest articles and notary tips while you wait for your first newsletter.</p>
            <Link href="/blog" legacyBehavior>
              <a className="text-sm text-teal-700 hover:text-teal-900 font-medium flex items-center">
                Read Articles <MessageSquarePlus className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
          <div className="bg-teal-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
            {/* You can add another relevant CTA here, e.g., Follow on Social Media, or a featured service */}
            <Smile className="h-8 w-8 text-teal-600 mb-3" /> {/* Placeholder icon */}
            <h3 className="font-semibold text-lg text-teal-800 mb-2">Spread the Word!</h3>
            <p className="text-sm text-gray-600 mb-3">Know someone who could benefit from our services or newsletter? Let them know!</p>
            {/* Add social share links or a link to your main services page */}
            <Link href="/services" legacyBehavior>
              <a className="text-sm text-teal-700 hover:text-teal-900 font-medium flex items-center">
                Our Services <MessageSquarePlus className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
        </div>

        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <Home className="h-5 w-5 mr-2" /> Go to Homepage
          </a>
        </Link>

        <p className="mt-10 text-xs text-gray-500">
          You can manage your subscription preferences or unsubscribe at any time from the link in our emails.
        </p>
      </div>
    </div>
  );
};

export default NewsletterThankYouPage; 