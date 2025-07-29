/**
 * Phase 6.1: Enhanced Local Landing Pages
 * Dynamic ZIP code pages for Local SEO Domination
 * Target: 6.1M "near me" searches with hyper-local content
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, MapPin, Clock, Star, CheckCircle, Car, Building, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LOCAL_SEO_ZIP_CODES, 
  LOCAL_CONTENT_CLUSTERS, 
  getLocationByZipCode, 
  getContentClusterBySlug,
  generateLocalKeywords,
  generateLocalBusinessSchema
} from '@/lib/local-seo-data';

interface PageProps {
  params: Promise<{
    zipCode: string;
  }>;
}

// Generate static params for all ZIP codes
export async function generateStaticParams() {
  return LOCAL_SEO_ZIP_CODES.map((location) => ({
    zipCode: location.zipCode,
  }));
}

// Generate metadata for each ZIP code page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zipCode } = await params;
  const location = getLocationByZipCode(zipCode);
  
  if (!location) {
    return {
      title: 'Mobile Notary Service | Houston Mobile Notary Pros',
      description: 'Professional mobile notary service in the Houston area.'
    };
  }

  const title = `Mobile Notary ${location.city} TX ${location.zipCode} | Houston Mobile Notary Pros`;
  const description = `Professional mobile notary service in ${location.city}, TX ${location.zipCode}. Same-day appointments, loan signings, and document notarization. Call 832-617-4285 now!`;
  
  return {
    title,
    description,
    keywords: generateLocalKeywords(location).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://houstonmobilenotarypros.com/mobile-notary-${location.zipCode}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Mobile Notary Service in ${location.city}, TX ${location.zipCode}`
        }
      ],
      siteName: 'Houston Mobile Notary Pros',
      locale: 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
      creator: '@houstonnotary'
    },
    alternates: {
      canonical: `https://houstonmobilenotarypros.com/mobile-notary-${location.zipCode}`
    }
  };
}

export default async function ZipCodeLandingPage({ params }: PageProps) {
  const { zipCode } = await params;
  const location = getLocationByZipCode(zipCode);
  
  if (!location) {
    notFound();
  }

  const localKeywords = generateLocalKeywords(location);
  const distanceText = location.distance === 0 ? 'Our home base' : `${location.distance} miles from our office`;
  
  // Service features with local context
  const serviceFeatures = [
    {
      icon: Car,
      title: 'Mobile Service',
      description: `We come to you anywhere in ${location.city}`,
      highlight: 'No travel fee within our service area'
    },
    {
      icon: Clock,
      title: 'Same-Day Service',
      description: 'Available 7 days a week',
      highlight: 'Emergency appointments available'
    },
    {
      icon: CheckCircle,
      title: 'Certified Notary',
      description: 'Texas state-commissioned notary public',
      highlight: 'Insured and bonded'
    },
    {
      icon: Building,
      title: 'Business Services',
      description: 'Corporate accounts and volume discounts',
      highlight: 'Serving local businesses'
    }
  ];

  // Local service areas with landmarks
  const nearbyServices = [
    ...location.landmarks.slice(0, 4).map(landmark => ({
      name: landmark,
      type: 'Landmark',
      description: `Mobile notary service near ${landmark}`
    })),
    ...location.medicalCenters.slice(0, 2).map(center => ({
      name: center,
      type: 'Medical Center',
      description: `Hospital and medical center notarizations`
    })),
    ...location.businessDistricts.slice(0, 2).map(district => ({
      name: district,
      type: 'Business District',
      description: `Corporate and business notary services`
    }))
  ];

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema(location))
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#002147] to-[#004080] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                {distanceText} • {location.county} County
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mobile Notary Service in {location.city}, TX {location.zipCode}
              </h1>
              
              <p className="text-xl mb-6 text-blue-100">
                Professional mobile notary service serving {location.city} and surrounding neighborhoods. 
                We bring the notary to you - home, office, or any convenient location.
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
              
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Serving {location.city} & {location.county} County</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Same-Day Service Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Features */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Why Choose Us for {location.city} Mobile Notary Service?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We're the trusted mobile notary service in {location.city}, TX {location.zipCode}. 
                  Our professional notaries are available when and where you need us.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {serviceFeatures.map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-2">{feature.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Local Service Areas */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#002147] mb-4">
                  Areas We Serve Near {location.city}, TX {location.zipCode}
                </h2>
                <p className="text-lg text-gray-600">
                  We provide mobile notary service to all neighborhoods, landmarks, and business districts in {location.city}.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyServices.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {service.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Local Information */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-[#002147] mb-6">
                    About {location.city}, TX {location.zipCode}
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      {location.city} is a thriving community in {location.county} County, Texas, 
                      with a population of approximately {location.population.toLocaleString()} residents. 
                      Located {location.distance === 0 ? 'at our home base' : `${location.distance} miles from our office`}, 
                      we provide fast and reliable mobile notary service to all residents and businesses.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-[#002147] mb-2">Population</h4>
                        <p className="text-gray-600">{location.population.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-[#002147] mb-2">Distance</h4>
                        <p className="text-gray-600">{distanceText}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#002147] mb-6">
                    Popular Landmarks & Locations
                  </h3>
                  <div className="grid gap-3">
                    {location.landmarks.map((landmark, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#002147] mr-3" />
                        <span className="text-gray-700">{landmark}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="py-16 bg-[#002147]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Mobile Notary Services in {location.city}, TX {location.zipCode}
              </h2>
              <p className="text-blue-100 mb-8">
                We offer comprehensive notary services for residents and businesses in {location.city}. 
                Same-day appointments available.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg text-left">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Document Notarization</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Legal documents</li>
                    <li>• Real estate documents</li>
                    <li>• Power of attorney</li>
                    <li>• Wills and trusts</li>
                    <li>• Affidavits</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg text-left">
                  <h3 className="text-xl font-bold text-[#002147] mb-4">Specialized Services</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Loan signings</li>
                    <li>• Apostille services</li>
                    <li>• Immigration documents</li>
                    <li>• Business formations</li>
                    <li>• Medical forms</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B1A1A] text-white">
                  <Phone className="mr-2 h-5 w-5" />
                  Call 832-617-4285
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                  <Link href="/booking">
                    Schedule Online
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 bg-gradient-to-r from-[#A52A2A] to-[#8B1A1A] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready for Mobile Notary Service in {location.city}?
              </h2>
              <p className="text-xl mb-8">
                Call us now at 832-617-4285 or book online for same-day service in {location.city}, TX {location.zipCode}.
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