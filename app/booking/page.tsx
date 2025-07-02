/**
 * Championship Booking System - Main Booking Page
 * Houston Mobile Notary Pros
 * 
 * Multi-step booking wizard designed for 95%+ completion rates.
 * Integrates all championship features: real-time pricing, slot reservation,
 * intelligent upsells, and confidence building.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import BookingWizard from '@/components/booking/BookingWizard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Book Your Notary Appointment | Houston Mobile Notary Pros',
  description: 'Professional mobile notary services in Houston. Book online with instant pricing, same-day availability, and $100K insurance coverage.',
  keywords: 'Houston notary, mobile notary, document notarization, loan signing, same day notary',
  openGraph: {
    title: 'Book Your Notary Appointment | Houston Mobile Notary Pros',
    description: 'Professional mobile notary services in Houston. Book online with instant pricing and same-day availability.',
    type: 'website',
    url: 'https://houstonmobilenotarypros.com/booking',
    images: [
      {
        url: 'https://houstonmobilenotarypros.com/booking-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros - Professional Booking System'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Notary Appointment | Houston Mobile Notary Pros',
    description: 'Professional mobile notary services in Houston. Book online with instant pricing.',
    images: ['https://houstonmobilenotarypros.com/booking-og.jpg']
  }
};

// Loading component for better UX
function BookingPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
            <Skeleton className="h-2 w-full" />
          </Card>
          
          {/* Main Content Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </Card>
          
          {/* Navigation Skeleton */}
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* SEO-optimized structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Mobile Notary Services",
            "provider": {
              "@type": "Organization",
              "name": "Houston Mobile Notary Pros",
              "url": "https://houstonmobilenotarypros.com",
              "telephone": "(713) 234-5678",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Houston",
                "addressRegion": "TX",
                "postalCode": "77591",
                "addressCountry": "US"
              }
            },
            "serviceType": "Notary Services",
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 29.7604,
                "longitude": -95.3698
              },
              "geoRadius": 25000
            },
            "offers": {
              "@type": "Offer",
              "price": "75.00",
              "priceCurrency": "USD",
              "description": "Professional mobile notary services starting at $75",
              "availability": "https://schema.org/InStock"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Notary Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Standard Notary Service"
                  },
                  "price": "75.00",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Extended Hours Notary"
                  },
                  "price": "100.00",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Loan Signing Specialist"
                  },
                  "price": "150.00",
                  "priceCurrency": "USD"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Remote Online Notarization"
                  },
                  "price": "35.00",
                  "priceCurrency": "USD"
                }
              ]
            }
          })
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Book Your Notary Appointment
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Professional mobile notary services in Houston with instant pricing and same-day availability
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700 mb-6">
              <div className="flex items-center space-x-1">
                <span className="text-green-600">✓</span>
                <span>$100K Insured</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-600">✓</span>
                <span>4.9/5 Rating (487+ Reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-600">✓</span>
                <span>Same-Day Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-600">✓</span>
                <span>30-Day Guarantee</span>
              </div>
            </div>
          </div>

          {/* Main Booking Wizard */}
          <Suspense fallback={<BookingPageSkeleton />}>
            <BookingWizard />
          </Suspense>
          
          {/* Trust and Security Footer */}
          <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Why Choose Houston Mobile Notary Pros?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-800">Licensed & Insured</strong><br />
                  Texas-licensed notary with $100,000 E&O insurance for your protection
                </div>
                <div>
                  <strong className="text-gray-800">Proven Experience</strong><br />
                  Over 2,000 successful appointments with 4.9/5 star rating
                </div>
                <div>
                  <strong className="text-gray-800">Secure & Reliable</strong><br />
                  SSL encrypted booking with 30-day satisfaction guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}