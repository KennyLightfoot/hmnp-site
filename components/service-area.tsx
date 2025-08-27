import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Mobile Notary Public",
  "provider": {
    "@type": "Organization",
    "name": "Houston Mobile Notary Pros",
    "url": "https://houstonmobilenotarypros.com" // Assuming main website URL
  },
  "name": "Mobile Notary Service Area Coverage for Houston and Surrounding Regions",
  "description": "Houston Mobile Notary Pros offers professional mobile notary services. Our primary service point is Texas City (ZIP 77591) with travel within a 20-mile radius. We also serve Greater Houston, including The Woodlands, Katy, Sugar Land, Galveston, League City, Pearland, and Baytown. Contact us for precise quotes for travel beyond the standard radius.",
  "areaServed": [
    {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "29.4052",
        "longitude": "-94.9355"
      },
      "geoRadius": "32186.9", // 20 miles in meters (20 * 1609.344)
      "description": "Primary service area: 20-mile radius around Texas City, TX 77591."
    },
    { "@type": "City", "name": "Houston", "address": { "@type": "PostalAddress", "addressLocality": "Houston", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "The Woodlands", "address": { "@type": "PostalAddress", "addressLocality": "The Woodlands", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "Katy", "address": { "@type": "PostalAddress", "addressLocality": "Katy", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "Sugar Land", "address": { "@type": "PostalAddress", "addressLocality": "Sugar Land", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "Galveston", "address": { "@type": "PostalAddress", "addressLocality": "Galveston", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "League City", "address": { "@type": "PostalAddress", "addressLocality": "League City", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "Pearland", "address": { "@type": "PostalAddress", "addressLocality": "Pearland", "addressRegion": "TX", "addressCountry": "US" } },
    { "@type": "City", "name": "Baytown", "address": { "@type": "PostalAddress", "addressLocality": "Baytown", "addressRegion": "TX", "addressCountry": "US" } }
  ],
  "hasMap": "https://houstonmobilenotarypros.com/services" // Assuming this component is primarily on the /services page
};

export default function ServiceArea() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
                <span className="text-[#002147] font-medium">Service Coverage</span>
              </div>
              <h2 className="text-3xl font-bold text-[#002147] mb-4">We Come to You in Greater Houston</h2>
              <p className="text-gray-700 mb-6">Texas City, Houston, The Woodlands, Katy, Sugar Land, Galveston, League City, Pearland, and Baytown.</p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">North & West</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Houston</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>The Woodlands</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Katy</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Sugar Land</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">South & East</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Galveston</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>League City</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Pearland</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                      <span>Baytown</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#002147]/5 p-5 rounded-lg border border-[#002147]/10 mb-6">
                <div className="flex items-start">
                  <div className="bg-[#002147] p-2 rounded-full mr-3 shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#002147] mb-1">Travel Made Simple</h3>
                    <p className="text-gray-700">From Texas City 77591: 0–20 miles included. 21–30 mi +$25, 31–40 +$45, 41–50 +$65.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/contact">
                  <Button className="bg-[#002147] hover:bg-[#001a38]">
                    Check Your Address
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Map removed for a cleaner layout */}
          </div>
        </div>
      </section>
    </>
  )
} 