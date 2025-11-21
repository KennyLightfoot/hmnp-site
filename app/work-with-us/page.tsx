import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import NotaryApplicationForm from "@/components/notary/NotaryApplicationForm"
import { CheckCircle, DollarSign, Clock, Users, Shield, MapPin } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Join Our Notary Network | Houston Mobile Notary Pros",
  description:
    "Join our network of trusted mobile notaries. Flexible scheduling, competitive pay, and support from an established team. Apply today to become a network notary.",
  keywords: "notary jobs, mobile notary jobs, become a notary, notary network, notary contractor",
  alternates: {
    canonical: '/work-with-us',
  },
  openGraph: {
    title: "Join Our Notary Network | Houston Mobile Notary Pros",
    description: "Join our network of trusted mobile notaries. Flexible scheduling, competitive pay, and support.",
    url: `${BASE_URL}/work-with-us`,
    siteName: 'Houston Mobile Notary Pros',
    type: 'website',
  },
}

export default function WorkWithUsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
          Join Our Notary Network
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join a trusted network of professional notaries. Get access to quality jobs, flexible scheduling, and competitive pay.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Competitive Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Earn competitive rates with transparent pay structure. Get paid promptly for completed jobs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Flexible Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Choose your own hours and accept jobs that fit your schedule. Work as much or as little as you want.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Support & Training</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get support from our team and access to training resources. We're here to help you succeed.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>What we're looking for in our network notaries</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Active notary commission in Texas (or state where you'll serve)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Errors & Omissions (E&O) insurance coverage</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Reliable transportation for mobile notary services</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Professional demeanor and excellent communication skills</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Ability to pass background check</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>W-9 form on file for tax purposes</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Simple process to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Submit Your Application</h3>
                <p className="text-gray-600">Fill out the form below with your information and credentials.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Review Process</h3>
                <p className="text-gray-600">We'll review your application and verify your credentials.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Onboarding</h3>
                <p className="text-gray-600">Complete onboarding, upload required documents, and set up your profile.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Start Accepting Jobs</h3>
                <p className="text-gray-600">Receive job offers and accept assignments that work for your schedule.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>Please fill out all required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <NotaryApplicationForm />
        </CardContent>
      </Card>
    </div>
  )
}

