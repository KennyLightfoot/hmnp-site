"use client";

import type { Metadata } from "next";
import { NextPage } from 'next';
import Link from 'next/link';
import { CheckCircle, ExternalLink, Home, MessageSquare, Users } from 'lucide-react'; // Added more icons
import { useEffect } from 'react'; // For tracking scripts

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const ThankYouFacebookPage: NextPage = () => {
  // Placeholder for Facebook Pixel event tracking (e.g., Lead event)
  useEffect(() => {
    // Facebook Pixel - Lead Event
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
      console.log("Facebook Pixel: Lead event tracked.");
    }
    
    // Google Ads Conversion Tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || 'AW-17079349538/CONVERSION_LABEL'
      });
      console.log("Google Ads: Conversion event tracked.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-xl w-full text-center transform transition-all duration-500 hover:scale-105">
        <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6 animate-pulse" /> 
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Offer Claimed Successfully!
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Thank you for claiming your exclusive Facebook offer! We're excited to have you. 
          We've received your details and will be in touch shortly if any further action is needed.
        </p>
        
        <div className="border-t border-gray-200 my-8"></div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-6">What's Next?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-sky-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
            <Users className="h-8 w-8 text-sky-600 mb-3" />
            <h3 className="font-semibold text-lg text-sky-800 mb-2">Explore Our Services</h3>
            <p className="text-sm text-gray-600 mb-3">Discover the full range of mobile notary services we offer.</p>
            <Link href="/services" legacyBehavior>
              <a className="text-sm text-sky-700 hover:text-sky-900 font-medium flex items-center">
                View Services <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
          <div className="bg-sky-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
            <MessageSquare className="h-8 w-8 text-sky-600 mb-3" />
            <h3 className="font-semibold text-lg text-sky-800 mb-2">Have Questions?</h3>
            <p className="text-sm text-gray-600 mb-3">Our team is ready to assist you with any inquiries.</p>
            <Link href="/contact" legacyBehavior>
              <a className="text-sm text-sky-700 hover:text-sky-900 font-medium flex items-center">
                Contact Us <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
        </div>

        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center bg-[#002147] hover:bg-[#001a38] text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <Home className="h-5 w-5 mr-2" /> Back to Homepage
          </a>
        </Link>

        <p className="mt-10 text-xs text-gray-500">
          You should receive an email confirmation shortly (if applicable for this offer).
        </p>
      </div>
    </div>
  );
};

export default ThankYouFacebookPage; 