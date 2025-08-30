"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/stripe-integration"

interface BookingDetails {
  id: string
  customerName: string
  customerEmail: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  scheduledDateTime: string
  serviceId: string
  priceAtBooking: number
  status: string
  urgency_level: string
  locationNotes?: string
  notes?: string
  travelFee: number
  urgencyFee: number
  paymentStatus: string
  paidAt?: string
  totalPaid?: number
  createdAt: string
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(bookingId)
    } else {
      setError("No booking ID provided")
      setIsLoading(false)
    }
  }, [bookingId])

  const fetchBookingDetails = async (id: string) => {
    try {
      const supabase = createClient()
      const { data, error: dbError } = await supabase.from("Booking").select("*").eq("id", id).single()

      if (dbError) throw dbError

      setBooking(data)
    } catch (err) {
      console.error("Failed to fetch booking details:", err)
      setError("Unable to load booking details. Please contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const getServiceDisplayName = (serviceId: string) => {
    const serviceNames = {
      "quick-stamp": "Quick-Stamp Local",
      "mobile-notary": "Standard Mobile Notary",
      "extended-hours": "Extended Hours Mobile",
      "loan-signing": "Loan Signing Specialist",
      "ron-service": "Remote Online Notarization",
    }
    return serviceNames[serviceId as keyof typeof serviceNames] || serviceId
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === "paid" && status === "confirmed") {
      return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
    }
    if (paymentStatus === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>
    }
    if (paymentStatus === "failed") {
      return <Badge className="bg-red-100 text-red-800">Payment Failed</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  const handleDownloadReceipt = () => {
    // In a real implementation, this would generate and download a PDF receipt
    console.log("[v0] Download receipt for booking:", bookingId)
    alert("Receipt download functionality would be implemented here")
  }

  const handleShareBooking = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: "Notary Appointment Confirmation",
          text: `My notary appointment is confirmed for ${formatDateTime(booking.scheduledDateTime).date} at ${formatDateTime(booking.scheduledDateTime).time}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Booking link copied to clipboard!")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-gray-600">Loading your booking confirmation...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{error || "Booking not found"}</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const dateTime = formatDateTime(booking.scheduledDateTime)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">Your notary appointment has been successfully scheduled</p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              {getStatusBadge(booking.status, booking.paymentStatus)}
              <span className="text-sm text-gray-500">
                Booking ID: <span className="font-mono">{booking.id}</span>
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{getServiceDisplayName(booking.serviceId)}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Badge variant="outline" className="mr-2">
                      {booking.urgency_level.charAt(0).toUpperCase() + booking.urgency_level.slice(1)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">{dateTime.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">{dateTime.time}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Special Instructions</h4>
                    <p className="text-sm text-gray-600">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Service Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{booking.addressStreet}</div>
                  <div className="text-gray-600">
                    {booking.addressCity}, {booking.addressState} {booking.addressZip}
                  </div>
                </div>

                {booking.locationNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Location Notes</h4>
                    <p className="text-sm text-gray-600">{booking.locationNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{booking.customerName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{booking.customerEmail}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>
                      {formatCurrency((booking.priceAtBooking - booking.travelFee - booking.urgencyFee) * 100)}
                    </span>
                  </div>
                  {booking.travelFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Travel Fee</span>
                      <span>{formatCurrency(booking.travelFee * 100)}</span>
                    </div>
                  )}
                  {booking.urgencyFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Priority Fee</span>
                      <span>{formatCurrency(booking.urgencyFee * 100)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span className="text-[#A52A2A]">
                      {formatCurrency((booking.totalPaid || booking.priceAtBooking) * 100)}
                    </span>
                  </div>
                </div>

                {booking.paidAt && (
                  <div className="text-sm text-gray-500">
                    Paid on{" "}
                    {new Date(booking.paidAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button onClick={handleDownloadReceipt} variant="outline" className="flex items-center bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button onClick={handleShareBooking} variant="outline" className="flex items-center bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share Booking
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A52A2A] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Confirmation Email</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive a detailed confirmation email with all appointment information
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A52A2A] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Prepare Documents</h3>
                  <p className="text-sm text-gray-600">Have your valid ID and all documents ready for notarization</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#A52A2A] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Notary Arrival</h3>
                  <p className="text-sm text-gray-600">Our certified notary will call 30 minutes before arrival</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Alert className="mt-6 border-blue-200 bg-blue-50">
            <Phone className="h-4 w-4" />
            <AlertDescription>
              <strong>Need to make changes or have questions?</strong>
              <br />
              Call us at{" "}
              <a href="tel:7135550123" className="font-semibold text-[#A52A2A]">
                (713) 555-0123
              </a>{" "}
              or email{" "}
              <a href="mailto:info@houstonmobilenotarypros.com" className="font-semibold text-[#A52A2A]">
                info@houstonmobilenotarypros.com
              </a>
            </AlertDescription>
          </Alert>
        </div>
      </main>
      <Footer />
    </div>
  )
}
