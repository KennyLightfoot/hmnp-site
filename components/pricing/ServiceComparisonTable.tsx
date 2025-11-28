'use client'

import { Check, X, Clock, MapPin, FileText, Users, DollarSign, Zap, Shield, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const services = [
  {
    name: 'Standard Mobile Notary',
    price: '$75',
    description: 'Professional document notarization',
    basePrice: 75,
    includedRadius: 20,
    maxDocuments: 4,
    maxSigners: 2,
    hours: '9am-5pm weekdays',
    features: [
      '≤4 documents included',
      '≤2 signers included',
      '≤20 miles travel included',
      '9am-5pm weekdays',
      'Professional notary service',
      'Same-day available (before 3pm)'
    ],
    addOns: [
      'Extra document: $10 each',
      'Extra signer: $5 each',
      'Travel beyond included radius: see travel tiers',
      'Weekend service: +$40'
    ],
    bestFor: 'Real estate documents, power of attorney, loan modifications, business agreements',
    popular: true,
    color: 'border-[#002147]',
    buttonColor: 'bg-[#002147] hover:bg-[#001a38]'
  },
  {
    name: 'Extended Hours Mobile',
    price: '$125',
    description: 'Flexible scheduling & same-day service',
    basePrice: 125,
    includedRadius: 30,
    maxDocuments: 4,
    maxSigners: 2,
    hours: '7am-9pm daily',
    features: [
      '≤4 documents included',
      '≤2 signers included',
      '≤30 miles travel included',
      '7am-9pm daily',
      'Flexible scheduling & same-day service',
      'Weekend availability'
    ],
    addOns: [
      'Same-day service: +$25 (after 3pm)',
      'Night service (9pm-7am): +$50',
      'Extra document: $10 each',
      'Extra signer: $5 each',
      'Travel beyond included radius: see travel tiers'
    ],
    bestFor: 'Urgent documents, after-hours needs, weekend signings, business clients',
    popular: false,
    color: 'border-[#A52A2A]',
    buttonColor: 'bg-[#A52A2A] hover:bg-[#8B0000]'
  },
  {
    name: 'Loan Signing Specialist',
    price: '$175',
    description: 'Expert real estate closings',
    basePrice: 175,
    includedRadius: 30,
    maxDocuments: 'Unlimited',
    maxSigners: 4,
    hours: 'By appointment',
    features: [
      'Single package (unlimited documents)',
      '≤4 signers included',
      'Print 2 sets included',
      '≤2 hours table time',
      'FedEx drop included',
      '≤30 miles travel included',
      'Real estate expertise',
      'Title company coordination'
    ],
    addOns: [
      'Rush print: +$20',
      'Scan-back: +$15',
      'Travel beyond included radius: see travel tiers'
    ],
    bestFor: 'Mortgage closings, refinancing, HELOC documents, reverse mortgages',
    popular: false,
    color: 'border-purple-500',
    buttonColor: 'bg-purple-600 hover:bg-purple-700'
  }
]

export default function ServiceComparisonTable() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#002147] mb-4">Service Comparison</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the service that best fits your needs. All services include travel within the specified radius and professional notary service.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {services.map((service, index) => (
          <Card 
            key={service.name} 
            className={`relative border-2 ${service.color} hover:shadow-xl transition-all duration-300 ${
              service.popular ? 'ring-2 ring-[#A52A2A] ring-opacity-50' : ''
            }`}
          >
            {service.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#A52A2A] text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-[#002147] mb-2">{service.name}</CardTitle>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <div className="text-3xl font-bold text-[#A52A2A] mb-2">{service.price}</div>
              <p className="text-sm text-gray-500">base price</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Features */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Travel included:</span>
                  <span className="font-medium">{service.includedRadius} miles</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium">{service.maxDocuments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Signers:</span>
                  <span className="font-medium">{service.maxSigners}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hours:</span>
                  <span className="font-medium text-xs">{service.hours}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 text-sm">What's Included:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add-ons */}
              {service.addOns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">Add-ons:</h4>
                  <ul className="space-y-1">
                    {service.addOns.map((addon, addonIndex) => (
                      <li key={addonIndex} className="text-xs text-gray-500">
                        • {addon}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best For */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Best For:</h4>
                <p className="text-xs text-gray-600">{service.bestFor}</p>
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full ${service.buttonColor} text-white h-11`}
                asChild
              >
                <a href={`/booking?service=${service.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  Book {service.name}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="text-center pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-[#002147] mb-4">Why Choose Houston Mobile Notary Pros?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <Shield className="h-8 w-8 text-green-500" />
            <span className="text-sm font-medium">Licensed & Insured</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            <span className="text-sm font-medium">4.9★ Rating</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-8 w-8 text-orange-500" />
            <span className="text-sm font-medium">Same-Day Available</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MapPin className="h-8 w-8 text-blue-500" />
            <span className="text-sm font-medium">25-Mile Coverage</span>
          </div>
        </div>
      </div>
    </div>
  )
}









