"use client" // Assuming client-side interactivity like Link might be needed

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/hero-background.jpg" alt="Houston skyline background for Houston Mobile Notary Pros" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/90 to-[#002147]/70"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-white">
            <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full">
              <span className="text-white font-medium">Professional Mobile Notary Services</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Notary Services <span className="text-[#91A3B0]">That Come To You</span>
            </h1>
            <p className="text-xl text-gray-100">
              Fast, reliable, and convenient notarization at your home, office, or preferred location throughout the
              Houston area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/booking">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
                  Book Now
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Our Services
                </Button>
              </Link>
            </div>
            <div className="flex items-center pt-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#A52A2A] flex items-center justify-center text-white text-xs">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full bg-[#91A3B0] flex items-center justify-center text-white text-xs">
                  SM
                </div>
                <div className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center text-xs">
                  KL
                </div>
              </div>
              <div className="ml-3 text-sm text-gray-200">
                <span className="font-medium">Trusted by 500+ clients</span> in the Houston area
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 backdrop-blur-sm bg-white/95">
              <div className="absolute top-0 right-0 bg-[#A52A2A] text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Professional Service
              </div>

              <div className="p-6 pt-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#002147]">Mobile Notary</h3>
                    <p className="text-gray-600">We come to you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700">Available 7 days a week</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700">Fast response times</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700">Experienced professionals</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-700">Serving all of Houston</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Starting at</p>
                      <p className="text-2xl font-bold text-[#002147]">$75</p>
                    </div>
                    <div className="bg-[#002147] text-white px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">Same-day available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#91A3B0]/30 rounded-full blur-md"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#A52A2A]/20 rounded-full blur-md"></div>
          </div>
        </div>
      </div>

      {/* Decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  )
} 