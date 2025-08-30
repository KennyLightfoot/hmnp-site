"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [selectedService, setSelectedService] = useState<string>("")

  useEffect(() => {
    const service = searchParams.get("service")
    if (service) {
      setSelectedService(service)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Your Notary Service</h1>
            <p className="text-lg text-gray-600">Complete your booking in just a few simple steps</p>
          </div>
          <BookingForm initialService={selectedService} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
