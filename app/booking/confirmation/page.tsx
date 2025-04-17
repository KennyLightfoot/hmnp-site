"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Calendar, Users, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingDetails {
  serviceName: string
  servicePrice: number
  numberOfSigners: number
  appointmentDate: string
  appointmentTime: string
}

export default function BookingConfirmationPage() {
  const [bookingReference, setBookingReference] = useState<string>("")
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)

  useEffect(() => {
    // Retrieve booking information from localStorage
    const reference = localStorage.getItem("bookingReference")
    const details = localStorage.getItem("bookingDetails")

    if (reference) {
      setBookingReference(reference)
    }

    if (details) {
      try {
        setBookingDetails(JSON.parse(details))
      } catch (error) {
        console.error("Error parsing booking details:", error)
      }
    }
  }, [])

  if (!bookingReference || !bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#002147] mb-4">Booking Information Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find your booking information. This may happen if you've cleared your browser data or if you're
            accessing this page directly.
          </p>
          <Link href="/booking">
            <Button>Create a New Booking</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your notary service has been scheduled. We'll be in touch shortly to confirm the details.
          </p>
        </div>

        <Card className="shadow-md mb-8">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle>Booking Reference: {bookingReference}</CardTitle>
            <CardDescription className="text-gray-200">
              Please save this reference number for your records
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-[#A52A2A] mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Service Details</h3>
                  <p>{bookingDetails.serviceName}</p>
                  <p className="text-sm text-gray-500">Price: ${bookingDetails.servicePrice}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-[#A52A2A] mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Appointment Time</h3>
                  <p>
                    {bookingDetails.appointmentDate} at {bookingDetails.appointmentTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 text-[#A52A2A] mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Number of Signers</h3>
                  <p>
                    {bookingDetails.numberOfSigners} {bookingDetails.numberOfSigners === 1 ? "Signer" : "Signers"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 flex flex-col items-start">
            <h3 className="font-semibold mb-2">What Happens Next?</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>You'll receive a confirmation email and text message shortly.</li>
              <li>Our notary will contact you to confirm the exact time on your selected date.</li>
              <li>Please ensure all signers have valid government-issued photo ID.</li>
              <li>Have all documents ready but unsigned before the notary arrives.</li>
            </ol>
          </CardFooter>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need to Reschedule?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you need to change your appointment time, please contact us at least 2 hours before your scheduled
                time to avoid cancellation fees.
              </p>
              <Button variant="outline" className="w-full">
                Contact Us to Reschedule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Have Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your booking or need additional information, our customer service team
                is here to help.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Customer Service
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full md:w-auto">
              Return to Homepage
            </Button>
          </Link>
          <Link href="/faq">
            <Button className="w-full md:w-auto bg-[#002147] hover:bg-[#001a38]">
              View Notary FAQs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
