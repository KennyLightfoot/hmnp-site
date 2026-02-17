/**
 * Phase 6.1: Enhanced Sugar Land Mobile Notary Page
 * Target: Local SEO domination for Sugar Land area searches
 * Serving ZIP codes 77479, 77478, 77487 with hyper-local content
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, CheckCircle, Users, Building, Car, Home, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Mobile Notary Sugar Land TX | Professional Service 77479, 77478, 77487 | Houston Mobile Notary Pros',
  description: 'Premium mobile notary service in Sugar Land, TX. Serving Sugar Land Town Square, First Colony, and all Sugar Land neighborhoods. Same-day appointments available. Call 832-617-4285!',
  keywords: 'mobile notary Sugar Land, Sugar Land notary service, mobile notary near me Sugar Land, Sugar Land mobile notary, notary public Sugar Land TX, same day notary Sugar Land, mobile notary First Colony, Sugar Land Town Square notary, mobile notary 77479, mobile notary 77478, mobile notary 77487, Sugar Land notary public',
  openGraph: {
    title: 'Mobile Notary Sugar Land TX | Professional Service 77479, 77478, 77487',
    description: 'Premium mobile notary service in Sugar Land, TX. Serving Sugar Land Town Square, First Colony, and all Sugar Land neighborhoods.',
    type: 'website',
    url: 'https://houstonmobilenotarypros.com/services/mobile-notary/sugar-land',
    images: [
      {
        url: '/og-sugar-land-mobile-notary.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobile Notary Service in Sugar Land, TX'
      }
    ],
    siteName: 'Houston Mobile Notary Pros',
    locale: 'en_US'
  },
  alternates: {
    canonical: 'https://houstonmobilenotarypros.com/services/mobile-notary/sugar-land'
  }
};

// Sugar Land JSON-LD Schema
const sugarLandSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Houston Mobile Notary Pros - Sugar Land",
  "description": "Premium mobile notary service in Sugar Land, TX. Serving Sugar Land Town Square, First Colony, and all Sugar Land neighborhoods with professional notary services.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sugar Land",
    "addressRegion": "TX",
    "postalCode": "77479",
    "addressCountry": "US"
  },
  "telephone": "832-617-4285",
  "url": "https://houstonmobilenotarypros.com/services/mobile-notary/sugar-land",
  "areaServed": [
    { "@type": "City", "name": "Sugar Land", "sameAs": "https://en.wikipedia.org/wiki/Sugar_Land,_Texas" },
    { "@type": "PostalAddress", "postalCode": "77479", "addressLocality": "Sugar Land", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77478", "addressLocality": "Sugar Land", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77487", "addressLocality": "Sugar Land", "addressRegion": "TX" },
    { "@type": "Place", "name": "Sugar Land Town Square", "address": { "@type": "PostalAddress", "addressLocality": "Sugar Land", "addressRegion": "TX" } },
    { "@type": "Place", "name": "First Colony", "address": { "@type": "PostalAddress", "addressLocality": "Sugar Land", "addressRegion": "TX" } }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "29.6196",
      "longitude": "-95.6349"
    },
    "geoRadius": "8047"
  },
  "priceRange": "$$$",
  "openingHours": [
    "Mo-Fr 09:00-17:00",
    "Sa-Su 09:00-17:00"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "247"
  }
};

// Sugar Land neighborhoods and areas
const sugarLandAreas = [
  {
    name: "Sugar Land Town Square",
    zipCode: "77479",
    landmarks: ["Sugar Land Town Square", "Smart Financial Centre", "Sugar Land City Hall"],
    description: "Premium mobile notary service for Sugar Land's main commercial and entertainment district",
    features: ["Business services", "Entertainment venues", "Municipal services"],
    type: "Commercial District"
  },
  {
    name: "First Colony",
    zipCode: "77479",
    landmarks: ["First Colony Mall", "First Colony MUD", "Brazos River"],
    description: "Mobile notary service for Sugar Land's established residential community",
    features: ["Residential services", "HOA documents", "Community services"],
    type: "Residential Community"
  },
  {
    name: "Greatwood",
    zipCode: "77479",
    landmarks: ["Greatwood Golf Club", "Greatwood Elementary", "Brazos River Park"],
    description: "Mobile notary service for Greatwood's upscale residential area",
    features: ["Luxury home services", "Golf club documents", "Private community"],
    type: "Upscale Residential"
  },
  {
    name: "New Territory",
    zipCode: "77479",
    landmarks: ["New Territory Golf Club", "Fort Bend County Libraries", "Oyster Creek Park"],
    description: "Mobile notary service for New Territory's family-oriented community",
    features: ["Family services", "Educational documents", "Community amenities"],
    type: "Family Community"
  },
  {
    name: "Sugar Creek",
    zipCode: "77478",
    landmarks: ["Sugar Creek Country Club", "Constellation Field", "Sugar Land Memorial Park"],
    description: "Mobile notary service for Sugar Creek's prestigious neighborhood",
    features: ["Country club services", "Sports venues", "Memorial services"],
    type: "Prestigious Area"
  },
  {
    name: "Telfair",
    zipCode: "77479",
    landmarks: ["Telfair Golf Club", "Telfair Shopping Center", "Telfair Park"],
    description: "Mobile notary service for Telfair's master-planned community",
    features: ["Master-planned community", "Golf services", "Shopping center"],
    type: "Master-Planned"
  }
];

// Sugar Land-specific premium services
const sugarLandServices = [
  {
    icon: Briefcase,
    title: "Executive Services",
    description: "Premium notary services for Sugar Land executives",
    features: ["Corporate executives", "Business formations", "Investment documents"],
    highlight: "Fortune 500 companies"
  },
  {
    icon: Home,
    title: "Luxury Real Estate",
    description: "Specialized service for high-value real estate",
    features: ["Luxury home closings", "Investment properties", "Commercial real estate"],
    highlight: "Million-dollar properties"
  },
  {
    icon: Building,
    title: "Corporate Services",
    description: "Business notary services for Sugar Land companies",
    features: ["Corporate documents", "Partnership agreements", "Merger documents"],
    highlight: "Energy corridor businesses"
  },
  {
    icon: Shield,
    title: "Estate Planning",
    description: "Comprehensive estate planning notary services",
    features: ["Wills and trusts", "Power of attorney", "Healthcare directives"],
    highlight: "High-net-worth individuals"
  }
];

// Popular Sugar Land locations
const popularLocations = [
  { name: "Sugar Land Town Square", type: "Entertainment District", zip: "77479", premium: true },
  { name: "Smart Financial Centre", type: "Event Venue", zip: "77479", premium: true },
  { name: "First Colony Mall", type: "Shopping Center", zip: "77479", premium: false },
  { name: "Houston Methodist Sugar Land Hospital", type: "Medical Center", zip: "77479", premium: false },
  { name: "Memorial Hermann Sugar Land", type: "Medical Center", zip: "77479", premium: false },
  { name: "Sugar Land City Hall", type: "Municipal Building", zip: "77479", premium: false },
  { name: "Constellation Field", type: "Sports Venue", zip: "77478", premium: true },
  { name: "Sugar Land Regional Airport", type: "Airport", zip: "77479", premium: true }
];

export default function SugarLandMobileNotaryPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sugarLandSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#002147] to-[#004080] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                32 Miles from Our Office • Fort Bend County • Premium Service
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Notary near you today — mobile to your door (Sugar Land)
              </h1>
              
              <p className="text-xl mb-6 text-blue-100">
                From $85. Same‑day available. 20–30 mi included around Sugar Land.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B1A1A] text-white min-w-[200px]">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 832-617-4285
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] min-w-[200px]">
                  <Link href="/booking" className="flex items-center">
                    Book Premium Service
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

        {/* Premium Services */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Premium Mobile Notary Services for Sugar Land
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We understand Sugar Land's sophisticated needs and provide premium mobile notary services 
                  for executives, luxury real estate, and high-net-worth individuals.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sugarLandServices.map((service, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow border-l-4 border-l-[#002147]">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center mb-4">
                        <service.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <ul className="space-y-1 mb-3">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-500">• {feature}</li>
                        ))}
                      </ul>
                      <Badge variant="secondary" className="text-xs bg-[#002147] text-white">
                        {service.highlight}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sugar Land Areas */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Sugar Land Communities We Serve
                </h2>
                <p className="text-lg text-gray-600">
                  Premium mobile notary service available in all Sugar Land neighborhoods and master-planned communities.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sugarLandAreas.map((area, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#002147]">{area.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">{area.zipCode}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            {area.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold text-sm text-[#002147]">Key Landmarks:</h4>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {area.landmarks.map((landmark, idx) => (
                              <li key={idx}>• {landmark}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#002147]">Specialized Services:</h4>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {area.features.map((feature, idx) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Popular Sugar Land Locations We Serve
                </h2>
                <p className="text-lg text-gray-600">
                  We provide premium mobile notary service at all major Sugar Land locations and venues.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularLocations.map((location, index) => (
                  <Card key={index} className={`hover:shadow-md transition-shadow ${location.premium ? 'border-l-4 border-l-[#A52A2A]' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm text-[#002147]">{location.name}</h3>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">{location.zip}</Badge>
                          {location.premium && (
                            <Badge variant="secondary" className="text-xs bg-[#A52A2A] text-white">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{location.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us for Sugar Land */}
        <div className="py-16 bg-[#002147] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Why Sugar Land Professionals Choose Us
                </h2>
                <p className="text-blue-100 mb-8">
                  We're the preferred mobile notary service for Sugar Land's discerning residents and businesses.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Executive Level Service</h3>
                  <p className="text-blue-100">
                    Premium service tailored for executives and high-net-worth individuals in Sugar Land.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Luxury Real Estate</h3>
                  <p className="text-blue-100">
                    Specialized in high-value real estate transactions and investment properties.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Premium Experience</h3>
                  <p className="text-blue-100">
                    White-glove service with attention to detail that Sugar Land residents expect.
                  </p>
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
                Ready for Sugar Land's Premier Mobile Notary Service?
              </h2>
              <p className="text-xl mb-8">
                Call us now at 832-617-4285 or book online for premium mobile notary service in Sugar Land.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 832-617-4285
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
                  <Link href="/booking">
                    Book Premium Service
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