'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClipboardList } from "lucide-react"

export default function ServicesNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6 text-[#A52A2A]">
          <ClipboardList size={64} />
        </div>
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Service Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          The service you're looking for is not available or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/services">
            <Button size="lg" className="bg-[#002147] hover:bg-[#002147]/90 w-full sm:w-auto">
              View All Services
            </Button>
          </Link>
          <Link href="/booking">
            <Button variant="outline" size="lg" className="border-[#A52A2A] text-[#A52A2A] w-full sm:w-auto">
              Book an Appointment
            </Button>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link href="/services/standard-notary" className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-[#002147]">Essential Services</h3>
            <p className="text-sm text-gray-600">Basic notary services for general documents</p>
          </Link>
          <Link href="/services/extended-hours-notary" className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-[#002147]">Priority Services</h3>
            <p className="text-sm text-gray-600">Expedited notary services with priority scheduling</p>
          </Link>
          <Link href="/services/loan-signing-specialist" className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-[#002147]">Loan Signing</h3>
            <p className="text-sm text-gray-600">Specialized services for real estate transactions</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
