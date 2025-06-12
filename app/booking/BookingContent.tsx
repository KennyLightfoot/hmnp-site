"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Suspense } from 'react';
import { ServiceBookingForm } from '@/components/service-booking-form';

function BookingContentInner() {
  const searchParams = useSearchParams();
  const service = searchParams?.get('service');
  const price = searchParams?.get('price');
  
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Book Your Mobile Notary Appointment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Schedule your notary service with our enhanced booking system. Choose your service, 
          select a time that works for you, and secure your appointment with a deposit.
        </p>
        {service && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg inline-block">
            <p className="text-blue-800">
              Pre-selected service: <span className="font-semibold">{service.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
              {price && <span className="ml-2 text-blue-600">${price}</span>}
            </p>
          </div>
        )}
      </header>

      {/* Booking Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Enhanced Booking Flow */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Enhanced Booking (Recommended)</CardTitle>
                <CardDescription>Complete step-by-step booking experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Service-aware calendar availability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span>Real-time promo code validation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Instant payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span>Automated confirmations</span>
              </div>
            </div>
            <Link href={`/booking/new${service ? `?service=${service}` : ''}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Enhanced Booking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Request Form */}
        <Card className="hover:border-gray-300 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Quick Request Form</CardTitle>
                <CardDescription>Traditional form-based booking</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Calendar integration</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span>Promo code support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>Manual time selection</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              const element = document.getElementById('quick-booking-form');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Use Quick Form
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="bg-gray-50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Why Choose Our Booking System?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-sm text-gray-600">
              Our system automatically adjusts availability based on service duration and business hours.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Secure Deposits</h3>
            <p className="text-sm text-gray-600">
              Stripe-powered secure payment processing to confirm your appointment.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Instant Confirmation</h3>
            <p className="text-sm text-gray-600">
              Automated email confirmations and reminders for your appointment.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Booking Form Section */}
      <div id="quick-booking-form" className="scroll-mt-8">
        <h2 className="text-3xl font-bold text-center mb-8">Quick Booking Form</h2>
        <div className="max-w-4xl mx-auto">
          <ServiceBookingForm />
        </div>
      </div>
    </div>
  );
}

export default function BookingContent() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    }>
      <BookingContentInner />
    </Suspense>
  );
} 