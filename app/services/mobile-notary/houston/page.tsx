import EstimatorStrip from '@/components/EstimatorStrip'

// lightweight hero + estimator sits inside the full page below

/**
 * Enhanced Houston Mobile Notary Page - Phase 6.1 Local SEO
 * Target: Capture Houston metro "near me" searches
 * Updated with hyper-local content and expanded ZIP code coverage
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, CheckCircle, Users, Building, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Mobile Notary Houston TX | Same-Day Service | Houston Mobile Notary Pros',
  description: 'Professional mobile notary service in Houston, TX. Serving all Houston ZIP codes with same-day appointments, loan signings, and document notarization. Call 832-617-4285!',
  keywords: 'mobile notary Houston, Houston notary service, mobile notary near me Houston, Houston mobile notary, notary public Houston TX, same day notary Houston, mobile notary downtown Houston, Houston medical center notary, mobile notary Galleria Houston, Houston Heights notary, mobile notary River Oaks, notary service Memorial Houston, mobile notary Montrose Houston, Houston mobile notary service',
  openGraph: {
    title: 'Mobile Notary Houston TX | Same-Day Service | Houston Mobile Notary Pros',
    description: 'Professional mobile notary service in Houston, TX. Serving all Houston ZIP codes with same-day appointments, loan signings, and document notarization.',
    type: 'website',
    url: 'https://houstonmobilenotarypros.com/services/mobile-notary/houston',
    images: [
      {
        url: '/og-houston-mobile-notary.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobile Notary Service in Houston, TX'
      }
    ],
    siteName: 'Houston Mobile Notary Pros',
    locale: 'en_US'
  },
  alternates: {
    canonical: 'https://houstonmobilenotarypros.com/services/mobile-notary/houston'
  }
};

// Houston JSON-LD Schema
const houstonSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Houston Mobile Notary Pros - Houston",
  "description": "Professional mobile notary service serving all Houston neighborhoods and ZIP codes. Same-day appointments, loan signings, and document notarization.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Houston",
    "addressRegion": "TX",
    "addressCountry": "US"
  },
  "telephone": "832-617-4285",
  "url": "https://houstonmobilenotarypros.com/services/mobile-notary/houston",
  "areaServed": [
    { "@type": "City", "name": "Houston", "sameAs": "https://en.wikipedia.org/wiki/Houston" },
    { "@type": "PostalAddress", "postalCode": "77002", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77003", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77004", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77005", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77006", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77007", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77008", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77009", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77030", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77056", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77057", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77019", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77079", "addressLocality": "Houston", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77094", "addressLocality": "Houston", "addressRegion": "TX" }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "29.7604",
      "longitude": "-95.3698"
    },
    "geoRadius": "40233"
  },
  "priceRange": "$$",
  "openingHours": [
    "Mo-Fr 09:00-17:00",
    "Sa-Su 09:00-17:00"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "247"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Mobile Notary Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Mobile Notary Service",
          "description": "Professional mobile notary service in Houston"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Loan Signing Services",
          "description": "Certified loan signing agent services"
        }
      }
    ]
  }
};

// Houston neighborhoods and areas with ZIP codes
const houstonAreas = [
  {
    name: "Downtown Houston",
    zipCodes: ["77002", "77003", "77004"],
    landmarks: ["Houston City Hall", "Minute Maid Park", "Toyota Center", "George R. Brown Convention Center"],
    description: "Professional mobile notary service in downtown Houston's business district"
  },
  {
    name: "Houston Medical Center",
    zipCodes: ["77030"],
    landmarks: ["Texas Medical Center", "Houston Methodist Hospital", "Memorial Hermann", "MD Anderson Cancer Center"],
    description: "Mobile notary service for medical center employees and patients"
  },
  {
    name: "Galleria Area",
    zipCodes: ["77056", "77057"],
    landmarks: ["Galleria Mall", "Williams Tower", "Post Oak Boulevard", "Westheimer Road"],
    description: "Mobile notary service in Houston's premier shopping and business district"
  },
  {
    name: "River Oaks & Memorial",
    zipCodes: ["77019", "77024"],
    landmarks: ["River Oaks Country Club", "Memorial Park", "Highland Village", "River Oaks Shopping Center"],
    description: "Upscale mobile notary service for River Oaks and Memorial area residents"
  },
  {
    name: "Houston Heights",
    zipCodes: ["77008", "77009"],
    landmarks: ["19th Street", "Heights Boulevard", "White Oak Bayou", "Heights Mercantile"],
    description: "Mobile notary service in the historic Houston Heights neighborhood"
  },
  {
    name: "Montrose & Midtown",
    zipCodes: ["77006", "77007"],
    landmarks: ["Montrose Boulevard", "Menil Collection", "Museum District", "Rice Village"],
    description: "Mobile notary service in Houston's arts and culture district"
  },
  {
    name: "West Houston",
    zipCodes: ["77079", "77094"],
    landmarks: ["Energy Corridor", "Westchase", "Briar Forest", "Eldridge Parkway"],
    description: "Mobile notary service for West Houston businesses and residents"
  },
  {
    name: "Rice Village & Museum District",
    zipCodes: ["77005"],
    landmarks: ["Rice University", "Houston Museum District", "Hermann Park", "Rice Village"],
    description: "Mobile notary service for university area and museum district"
  }
];

// Houston-specific services
const houstonServices = [
  {
    icon: Building,
    title: "Corporate Services",
    description: "Serving Houston's major business districts",
    features: ["Volume discounts", "Corporate accounts", "Same-day service"]
  },
  {
    icon: Car,
    title: "Medical Center Services",
    description: "Specialized service for medical professionals",
    features: ["Hospital visits", "Medical forms", "HIPAA compliant"]
  },
  {
    icon: Users,
    title: "Real Estate Services",
    description: "Houston real estate transaction support",
    features: ["Loan signings", "Closing documents", "Title company partnerships"]
  },
  {
    icon: CheckCircle,
    title: "Same-Day Service",
    description: "Available throughout Houston metro",
    features: ["2-hour response", "Emergency service", "Weekend availability"]
  }
];

export default function HoustonMobileNotaryPage() {
  return (
    <>
      {/* Quick Estimator at top for conversions */}
      <div className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">Mobile Notary in Houston — Book Today</h1>
          <p className="mt-2 text-white/90">From $85 • 25‑mile radius • NNA certified • On‑time or we discount</p>
        </div>
      </div>
      <section className="container mx-auto px-4 -mt-6">
        <EstimatorStrip defaultMode="MOBILE" />
      </section>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(houstonSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#002147] to-[#004080] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                Serving All Houston ZIP Codes • Harris County
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Notary near you today — mobile to your door (Houston)
              </h1>
              
              <p className="text-xl mb-6 text-blue-100">
                From $85. Same‑day available. 20–30 mi included across Houston.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B1A1A] text-white min-w-[200px]">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 832-617-4285
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] min-w-[200px]">
                  <Link href="/booking" className="flex items-center">
                    Book Online Now
                  </Link>
                </Button>
              </div>
              <div className="mt-2 text-xs text-blue-100">
                <Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link>
              </div>
              
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">Same‑day windows</span>
                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">20–30 mi included</span>
                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">Transparent pricing</span>
                <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1">$1M E&O</span>
              </div>
            </div>
          </div>
        </div>

        {/* Houston-Specific Services */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Houston's Premier Mobile Notary Service
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We understand Houston's unique business needs and provide specialized mobile notary services 
                  for all industries and neighborhoods throughout Harris County.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {houstonServices.map((service, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center mb-4">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-500">• {feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Houston Areas & ZIP Codes */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Houston Areas We Serve
                </h2>
                <p className="text-lg text-gray-600">
                  Professional mobile notary service available in all Houston neighborhoods and ZIP codes.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {houstonAreas.map((area, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-[#002147]">{area.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {area.zipCodes.map((zipCode, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {zipCode}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-[#002147]">Popular Landmarks:</h4>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {area.landmarks.slice(0, 3).map((landmark, idx) => (
                            <li key={idx}>• {landmark}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Houston Business Districts */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Houston Business District Services
                </h2>
                <p className="text-lg text-gray-600">
                  We specialize in serving Houston's major business districts with corporate-level mobile notary services.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Downtown Houston Business District</h3>
                  <p className="text-gray-600 mb-4">
                    Serving downtown Houston's corporate offices, law firms, and financial institutions.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• JPMorgan Chase Tower</li>
                    <li>• Wells Fargo Plaza</li>
                    <li>• Bank of America Center</li>
                    <li>• Houston City Hall</li>
                    <li>• Harris County Courthouse</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Energy Corridor</h3>
                  <p className="text-gray-600 mb-4">
                    Mobile notary services for Houston's energy companies and corporate headquarters.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Katy Freeway corporate offices</li>
                    <li>• Westchase business district</li>
                    <li>• Energy companies</li>
                    <li>• Corporate headquarters</li>
                    <li>• Professional services firms</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Texas Medical Center</h3>
                  <p className="text-gray-600 mb-4">
                    Specialized mobile notary service for medical professionals and patients.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Hospital bedside notarizations</li>
                    <li>• Medical power of attorney</li>
                    <li>• HIPAA-compliant services</li>
                    <li>• Healthcare facility visits</li>
                    <li>• Medical staff documents</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Galleria Area</h3>
                  <p className="text-gray-600 mb-4">
                    Premium mobile notary service for Houston's upscale shopping and business district.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Galleria office towers</li>
                    <li>• Post Oak Boulevard</li>
                    <li>• Westheimer corridor</li>
                    <li>• High-end residential</li>
                    <li>• Luxury retail locations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 bg-gradient-to-r from-[#A52A2A] to-[#8B1A1A] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready for Houston's Best Mobile Notary Service?
              </h2>
              <p className="text-xl mb-8">
                Call us now at 832-617-4285 or book online for same-day service anywhere in Houston.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 832-617-4285
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
                  <Link href="/booking">
                    Book Online Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 