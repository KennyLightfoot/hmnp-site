/**
 * Phase 6.1: Enhanced Pearland Mobile Notary Page
 * Target: Local SEO domination for Pearland area searches
 * Serving ZIP codes 77581, 77584 with hyper-local content
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, CheckCircle, Users, Building, Car, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Mobile Notary Pearland TX | Same-Day Service 77581, 77584 | Houston Mobile Notary Pros',
  description: 'Professional mobile notary service in Pearland, TX. Serving Shadow Creek Ranch, Pearland Town Center, and all Pearland neighborhoods. Same-day appointments available. Call 832-617-4285!',
  keywords: 'mobile notary Pearland, Pearland notary service, mobile notary near me Pearland, Pearland mobile notary, notary public Pearland TX, same day notary Pearland, mobile notary Shadow Creek Ranch, Pearland Town Center notary, mobile notary 77581, mobile notary 77584, Pearland notary public, mobile notary Pearland TX',
  openGraph: {
    title: 'Mobile Notary Pearland TX | Same-Day Service 77581, 77584',
    description: 'Professional mobile notary service in Pearland, TX. Serving Shadow Creek Ranch, Pearland Town Center, and all Pearland neighborhoods.',
    type: 'website',
    url: 'https://houstonmobilenotarypros.com/services/mobile-notary/pearland',
    images: [
      {
        url: '/og-pearland-mobile-notary.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobile Notary Service in Pearland, TX'
      }
    ],
    siteName: 'Houston Mobile Notary Pros',
    locale: 'en_US'
  },
  alternates: {
    canonical: 'https://houstonmobilenotarypros.com/services/mobile-notary/pearland'
  }
};

// Pearland JSON-LD Schema
const pearlandSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Houston Mobile Notary Pros - Pearland",
  "description": "Professional mobile notary service in Pearland, TX. Serving Shadow Creek Ranch, Pearland Town Center, and all Pearland neighborhoods with same-day appointments.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Pearland",
    "addressRegion": "TX",
    "postalCode": "77581",
    "addressCountry": "US"
  },
  "telephone": "832-617-4285",
  "url": "https://houstonmobilenotarypros.com/services/mobile-notary/pearland",
  "areaServed": [
    { "@type": "City", "name": "Pearland", "sameAs": "https://en.wikipedia.org/wiki/Pearland,_Texas" },
    { "@type": "PostalAddress", "postalCode": "77581", "addressLocality": "Pearland", "addressRegion": "TX" },
    { "@type": "PostalAddress", "postalCode": "77584", "addressLocality": "Pearland", "addressRegion": "TX" },
    { "@type": "Place", "name": "Shadow Creek Ranch", "address": { "@type": "PostalAddress", "addressLocality": "Pearland", "addressRegion": "TX" } },
    { "@type": "Place", "name": "Pearland Town Center", "address": { "@type": "PostalAddress", "addressLocality": "Pearland", "addressRegion": "TX" } }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "29.5638",
      "longitude": "-95.2861"
    },
    "geoRadius": "8047"
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
    "name": "Pearland Mobile Notary Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Mobile Notary Service",
          "description": "Professional mobile notary service in Pearland, TX"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Real Estate Notary",
          "description": "Real estate document notarization in Pearland"
        }
      }
    ]
  }
};

// Pearland neighborhoods and areas
const pearlandAreas = [
  {
    name: "Shadow Creek Ranch",
    zipCode: "77584",
    landmarks: ["Shadow Creek Ranch Golf Club", "Shadow Creek Ranch Town Center", "Independence Park"],
    description: "Premier mobile notary service for Shadow Creek Ranch residents and businesses",
    features: ["New home closings", "HOA documents", "Residential services"]
  },
  {
    name: "Pearland Town Center",
    zipCode: "77581",
    landmarks: ["Pearland Town Center", "Pearland Recreation Center", "Centennial Park"],
    description: "Mobile notary service in Pearland's main commercial and entertainment district",
    features: ["Business services", "Shopping center visits", "Entertainment venues"]
  },
  {
    name: "West Pearland",
    zipCode: "77581",
    landmarks: ["Houston Methodist Pearland Hospital", "Pearland High School", "Pearland Library"],
    description: "Mobile notary service for established Pearland neighborhoods",
    features: ["Hospital visits", "School district services", "Community services"]
  },
  {
    name: "South Pearland",
    zipCode: "77584",
    landmarks: ["Dawson High School", "Pearland Regional Airport", "John Hardin Park"],
    description: "Mobile notary service for newer Pearland developments",
    features: ["New construction", "Family services", "Aviation services"]
  }
];

// Pearland-specific services
const pearlandServices = [
  {
    icon: Home,
    title: "New Home Services",
    description: "Serving Pearland's growing residential market",
    features: ["New construction closings", "HOA documents", "Builder services"],
    highlight: "Shadow Creek Ranch specialist"
  },
  {
    icon: Building,
    title: "Business Services",
    description: "Corporate notary services for Pearland businesses",
    features: ["Corporate documents", "Business formations", "Commercial real estate"],
    highlight: "Town Center businesses"
  },
  {
    icon: Shield,
    title: "Medical Services",
    description: "Healthcare notary services",
    features: ["Hospital visits", "Medical power of attorney", "Healthcare directives"],
    highlight: "Methodist Hospital partnership"
  },
  {
    icon: Car,
    title: "Mobile Convenience",
    description: "We come to you anywhere in Pearland",
    features: ["Home visits", "Office visits", "Public locations"],
    highlight: "22 miles from our office"
  }
];

// Popular Pearland locations
const popularLocations = [
  { name: "Pearland Town Center", type: "Shopping & Entertainment", zip: "77581" },
  { name: "Shadow Creek Ranch Golf Club", type: "Recreation", zip: "77584" },
  { name: "Houston Methodist Pearland Hospital", type: "Medical Center", zip: "77584" },
  { name: "Pearland Recreation Center", type: "Community Center", zip: "77581" },
  { name: "Dawson High School", type: "School", zip: "77584" },
  { name: "Pearland High School", type: "School", zip: "77581" },
  { name: "Centennial Park", type: "Park", zip: "77581" },
  { name: "Independence Park", type: "Park", zip: "77584" }
];

export default function PearlandMobileNotaryPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pearlandSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#002147] to-[#004080] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                22 Miles from Our Office • Brazoria County
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mobile Notary Service in Pearland, TX
              </h1>
              
              <p className="text-xl mb-6 text-blue-100">
                Professional mobile notary service serving Pearland, Shadow Creek Ranch, and Pearland Town Center. 
                We bring certified notary services to your home, office, or any convenient location.
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
              
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>4.9/5 Rating • 247 Reviews</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Serving ZIP codes 77581, 77584</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Same-Day Service Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pearland-Specific Services */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Pearland's Trusted Mobile Notary Service
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We understand Pearland's unique needs as a growing community. Our mobile notary services 
                  are designed to serve both established neighborhoods and new developments.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pearlandServices.map((service, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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
                      <Badge variant="secondary" className="text-xs">
                        {service.highlight}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pearland Areas */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Pearland Areas We Serve
                </h2>
                <p className="text-lg text-gray-600">
                  Mobile notary service available in all Pearland neighborhoods, from Shadow Creek Ranch to Pearland Town Center.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {pearlandAreas.map((area, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#002147]">{area.name}</CardTitle>
                        <Badge variant="outline">{area.zipCode}</Badge>
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
                          <h4 className="font-semibold text-sm text-[#002147]">Services:</h4>
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
                  Popular Pearland Locations We Serve
                </h2>
                <p className="text-lg text-gray-600">
                  We provide mobile notary service at all popular Pearland locations and landmarks.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularLocations.map((location, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm text-[#002147]">{location.name}</h3>
                        <Badge variant="outline" className="text-xs">{location.zip}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{location.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us for Pearland */}
        <div className="py-16 bg-[#002147] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Why Pearland Residents Choose Us
                </h2>
                <p className="text-blue-100 mb-8">
                  We're the preferred mobile notary service in Pearland, serving both established and new neighborhoods.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Same-Day Service</h3>
                  <p className="text-blue-100">
                    Available 7 days a week with 2-hour response time for urgent needs in Pearland.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Home className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">New Home Specialist</h3>
                  <p className="text-blue-100">
                    Experienced with new construction closings and HOA documents in Shadow Creek Ranch.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Local Knowledge</h3>
                  <p className="text-blue-100">
                    Familiar with Pearland's neighborhoods, landmarks, and local business requirements.
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
                Ready for Pearland's Best Mobile Notary Service?
              </h2>
              <p className="text-xl mb-8">
                Call us now at 832-617-4285 or book online for same-day service anywhere in Pearland.
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