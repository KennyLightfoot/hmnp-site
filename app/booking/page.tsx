/**
 * Enhanced Booking Page - Houston Mobile Notary Pros
 * Advanced booking form with enhanced features and better UX
 */

'use client';

import { useState } from 'react';
import BookingForm from '@/components/booking/BookingForm';
import ExpressBookingPanel from '@/components/booking/ExpressBookingPanel';
import RONBookingForm from '@/components/booking/RONBookingForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import GuaranteeStrip from '@/components/guarantees/GuaranteeStrip';
import Link from 'next/link';
import { 
  Zap, 
  Calendar,
  ArrowRight,
  CheckCircle,
  FileText,
  BadgeCent,
  Monitor,
  Video
} from 'lucide-react';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'express' | 'full' | 'remote'>('express');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your Notary Appointment
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Not sure what you need? Get a callback and we'll help. Ready to lock a time? Book online now.
          </p>
        </div>

        {/* Guarantee Strip */}
        <div className="max-w-4xl mx-auto mb-8">
          <GuaranteeStrip variant="compact" />
        </div>

        {/* Booking Options Tabs */}
        <div className="max-w-6xl mx-auto mb-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'express' | 'full' | 'remote')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto mb-8">
              <TabsTrigger value="express" className="flex flex-col items-center space-y-1 py-3">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Express Callback</span>
                <span className="text-xs opacity-75">Need help choosing?</span>
              </TabsTrigger>
              <TabsTrigger value="full" className="flex flex-col items-center space-y-1 py-3">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Full Online Booking</span>
                <span className="text-xs opacity-75">Ready to lock a time?</span>
              </TabsTrigger>
              <TabsTrigger value="remote" className="flex flex-col items-center space-y-1 py-3">
                <Video className="h-5 w-5" />
                <span className="font-semibold">Remote Online</span>
                <span className="text-xs opacity-75">Notarize from anywhere</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="express" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ExpressBookingPanel />
                </div>
                <div className="lg:col-span-1">
                  <Card className="border-blue-100 bg-blue-50 h-full">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Why Choose Express?</h3>
                      <ul className="space-y-2 text-sm text-blue-800 mb-4">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Get a callback within 15 minutes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>No need to pick a time slot now</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Perfect if you're still deciding</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>We'll help you find the best option</span>
                        </li>
                      </ul>
                      <div className="bg-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-900 font-medium">No payment required now</p>
                        <p className="text-xs text-blue-700">You'll see exact total before confirming</p>
                      </div>
                      <div className="pt-4 border-t border-blue-200">
                        <button
                          onClick={() => setActiveTab('full')}
                          className="text-sm text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <span>Prefer to book online?</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="full" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BookingForm />
                </div>
                <div className="lg:col-span-1">
                  <Card className="border-green-100 bg-green-50 h-full">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-green-900 mb-3">Full Online Booking</h3>
                      <ul className="space-y-2 text-sm text-green-800 mb-4">
                        <li className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Pick your exact date and time</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>See real-time availability</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Get instant confirmation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Complete booking in minutes</span>
                        </li>
                      </ul>
                      <div className="bg-green-100 rounded-lg p-3 mb-4">
                        <p className="text-xs text-green-900 font-medium">No payment required now</p>
                        <p className="text-xs text-green-700">You'll see exact total before confirming</p>
                      </div>
                      <div className="pt-4 border-t border-green-200">
                        <button
                          onClick={() => setActiveTab('express')}
                          className="text-sm text-green-700 hover:text-green-900 flex items-center space-x-1"
                        >
                          <span>Want a quick callback instead?</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Remote Online Notarization Tab */}
            <TabsContent value="remote" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RONBookingForm />
                </div>
                <div className="lg:col-span-1">
                  <Card className="border-blue-100 bg-blue-50 h-full">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">Remote Online Notarization</h3>
                      <ul className="space-y-2 text-sm text-blue-800 mb-4">
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Notarize from anywhere with internet</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Available 24/7 with minimal wait time</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Secure ID verification included</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">✓</span>
                          <span>Valid in all 50 states</span>
                        </li>
                      </ul>
                      <div className="bg-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-900 font-medium">Payment required to create session</p>
                        <p className="text-xs text-blue-700">From $35 per session · 1 seal included · no travel fee</p>
                      </div>
                      <div className="pt-4 border-t border-blue-200">
                        <Link href="/ron/how-it-works" className="text-sm text-blue-700 hover:text-blue-900 flex items-center">
                          <span>Learn how RON works</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* What to Expect Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-2 border-[#002147]/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#002147] mb-4 text-center">What to Expect</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#002147]">Documents Ready</p>
                    <p className="text-gray-600">Don't sign beforehand—notary must witness</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <BadgeCent className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#002147]">Valid ID Required</p>
                    <p className="text-gray-600">Government-issued photo ID for all signers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#002147]">Professional Service</p>
                    <p className="text-gray-600">On-time arrival, clear guidance, accurate execution</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline text-sm font-medium">
                  Learn more about our process →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Trust Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Why Choose Houston Mobile Notary Pros?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">🔒</span>
                </div>
                <strong className="text-gray-800 block mb-1">Licensed & Insured</strong>
                <span className="text-gray-600">Texas-licensed with $100K E&O insurance</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">⭐</span>
                </div>
                <strong className="text-gray-800 block mb-1">Proven Experience</strong>
                <span className="text-gray-600">4.9/5 rating with 2,000+ appointments</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">⚡</span>
                </div>
                <strong className="text-gray-800 block mb-1">Same-Day Available</strong>
                <span className="text-gray-600">Quick response times and flexible scheduling</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 text-xl">📱</span>
                </div>
                <strong className="text-gray-800 block mb-1">Mobile Optimized</strong>
                <span className="text-gray-600">Perfect experience on any device</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}