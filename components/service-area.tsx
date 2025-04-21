import Link from "next/link"
import Image from "next/image"
import { MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ServiceArea() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">Service Coverage</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Our Service Area</h2>
            <p className="text-gray-600 mb-6">
              We proudly serve the greater Houston area, including but not limited to:
            </p>

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
                  <h3 className="font-semibold text-[#002147] mb-1">Standard Service Area & Travel Fees</h3>
                  <p className="text-gray-700">
                    Our primary service point is based in Texas City (ZIP 77591). Our standard service packages include travel within a 20-mile radius of this location. We gladly travel to all listed areas and beyond, with an additional travel fee of $0.50 per mile applying for distances beyond the initial 20 miles from 77591. Please contact us for a precise quote if you are unsure about potential travel fees for your location.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/contact">
                <Button className="bg-[#002147] hover:bg-[#001a38]">
                  Check if We Serve Your Area
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="h-[450px] rounded-lg overflow-hidden shadow-md border border-gray-200">
              <Image
                src="/texas-city-radius.png"
                alt="Service area map showing 20-mile radius from ZIP 77591"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/60 to-transparent"></div>

              {/* Service radius indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] border-2 border-[#A52A2A] rounded-full opacity-70 flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#A52A2A] rounded-full"></div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-[#A52A2A] rounded-full mr-2"></div>
                  <p className="font-semibold">Base ZIP 77591 (Texas City, TX)</p>
                </div>
                <p className="text-sm mb-1">20-mile standard service radius included in packages</p>
                <p className="text-sm">Extended coverage available for additional fee (calculated from 77591)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 