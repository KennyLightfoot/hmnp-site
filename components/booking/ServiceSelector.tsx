'use client';

/**
 * Championship Booking System - Service Selection Component
 * Houston Mobile Notary Pros
 * 
 * Conversion-optimized service selector with smart recommendations,
 * real-time pricing, and psychological triggers for higher conversions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  Shield, 
  Star, 
  Zap, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Types
interface ServiceOption {
  id: string;
  name: string;
  price: number;
  description: string;
  hours: string;
  included: string[];
  features?: string[];
  maxDocuments: number;
  includedRadius: number;
  badge?: 'popular' | 'recommended' | 'urgent' | 'value';
  savings?: number;
  urgencyText?: string;
}

interface ServiceSelectorProps {
  selectedService?: string;
  onServiceSelect: (serviceId: string) => void;
  documentCount?: number;
  urgency?: 'today' | 'this-week' | 'next-week' | 'flexible';
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  location?: string;
  distance?: number;
  className?: string;
}

interface SmartRecommendation {
  serviceId: string;
  reason: string;
  savings?: number;
  urgency?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Service configuration matching the pricing engine - ALL 6 SERVICES
const SERVICES: ServiceOption[] = [
  {
    id: 'QUICK_STAMP_LOCAL',
    name: 'Quick-Stamp Local',
    price: 50,
    description: 'Fast & simple local signings for routine documents',
    hours: '9am-5pm Mon-Fri',
    included: [
      '≤ 1 document',
      '1 signer included',
      '10-mile travel radius',
      'Same-day available (before 3pm)',
      'Fast turnaround'
    ],
    maxDocuments: 1,
    includedRadius: 10,
    badge: 'value'
  },
  {
    id: 'STANDARD_NOTARY',
    name: 'Standard Notary',
    price: 75,
    description: 'Perfect for routine document notarization during business hours',
    hours: '9am-5pm Mon-Fri',
    included: [
      'Up to 2 documents',
      '1-2 signers included',
      '30-mile travel radius',
      'Professional notary service',
      'Same-day available (before 3pm)'
    ],
    maxDocuments: 2,
    includedRadius: 30,
    badge: 'popular'
  },
  {
    id: 'EXTENDED_HOURS',
    name: 'Extended Hours',
    price: 100,
    description: 'Extended availability for urgent needs and after-hours appointments',
    hours: '7am-9pm Daily',
    included: [
      'Up to 5 documents',
      '2 signers included',
      '30-mile travel radius',
      'Same-day guarantee',
      'Evening appointments',
      'Weekend availability'
    ],
    features: ['urgent', 'same-day', 'evening'],
    maxDocuments: 5,
    includedRadius: 30,
    badge: 'recommended'
  },
  {
    id: 'LOAN_SIGNING',
    name: 'Loan Signing Specialist',
    price: 150,
    description: 'Specialized expertise for loan documents and real estate transactions',
    hours: 'By appointment',
    included: [
      'Unlimited documents',
      'Up to 4 signers',
      '90-minute session',
      'Real estate expertise',
      'Title company coordination',
      '30-mile travel radius'
    ],
    maxDocuments: 999,
    includedRadius: 30,
    badge: 'value'
  },
  {
    id: 'RON_SERVICES',
    name: 'Remote Online Notarization',
    price: 35,
    description: 'Secure remote notarization from anywhere, available 24/7',
    hours: '24/7 Availability',
    included: [
      'Remote service',
      'No travel required',
      'Up to 10 documents',
      'Secure digital process',
      'Immediate availability',
      'Proof.com platform'
    ],
    maxDocuments: 10,
    includedRadius: 0,
    urgencyText: 'Available now'
  },
  {
    id: 'BUSINESS_ESSENTIALS',
    name: 'Business Subscription - Essentials',
    price: 125,
    description: 'Monthly subscription for regular business notarization needs',
    hours: '24/7 RON availability',
    included: [
      'Up to 10 RON seals/month',
      '10% off mobile rates',
      'Monthly billing',
      'Priority support',
      'Remote service',
      'No travel required'
    ],
    maxDocuments: 10,
    includedRadius: 0,
    badge: 'recommended'
  },
  {
    id: 'BUSINESS_GROWTH',
    name: 'Business Subscription - Growth',
    price: 349,
    description: 'Premium monthly subscription for high-volume business needs',
    hours: '24/7 RON availability',
    included: [
      'Up to 40 RON seals/month',
      '10% off mobile rates',
      '1 free loan signing/month',
      'Monthly billing',
      'Priority support',
      'Remote service',
      'Account manager'
    ],
    maxDocuments: 40,
    includedRadius: 0,
    badge: 'value'
  }
];

const TRUST_SIGNALS = [
  { icon: Shield, text: '$100K Insured', color: 'text-green-600' },
  { icon: Star, text: '4.9/5 Rating (487 reviews)', color: 'text-yellow-600' },
  { icon: CheckCircle, text: 'Texas Licensed', color: 'text-blue-600' },
  { icon: Clock, text: '2,000+ Appointments Completed', color: 'text-purple-600' }
];

export default function ServiceSelector({
  selectedService,
  onServiceSelect,
  documentCount = 1,
  urgency = 'flexible',
  timePreference = 'flexible',
  location,
  distance = 0,
  className = ''
}: ServiceSelectorProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Smart recommendation engine
  const smartRecommendation = useMemo((): SmartRecommendation | null => {
    // Same-day urgent requests
    if (urgency === 'today') {
      const currentHour = new Date().getHours();
      if (currentHour >= 15) {
        return {
          serviceId: 'EXTENDED_HOURS',
          reason: 'Same-day service after 3pm requires Extended Hours',
          confidence: 'high',
          urgency: 'Limited availability'
        };
      } else {
        return {
          serviceId: 'STANDARD_NOTARY',
          reason: 'Same-day service available before 3pm',
          confidence: 'high'
        };
      }
    }

    // Evening preference
    if (timePreference === 'evening') {
      return {
        serviceId: 'EXTENDED_HOURS',
        reason: 'Evening appointments require Extended Hours service',
        confidence: 'high'
      };
    }

    // Multiple documents
    if (documentCount > 2) {
      const standardCost = 75 + ((documentCount - 2) * 15); // Estimated additional doc fee
      const extendedCost = 100;
      const savings = Math.max(0, standardCost - extendedCost);
      
      return {
        serviceId: 'EXTENDED_HOURS',
        reason: `Better value for ${documentCount} documents`,
        savings,
        confidence: 'high'
      };
    }

    // Distance-based recommendation
    if (distance > 15) {
      const extraTravelFee = (distance - 15) * 0.50;
      const extendedSavings = Math.max(0, (distance - 20) * 0.50);
      
      if (extendedSavings > 0) {
        return {
          serviceId: 'EXTENDED_HOURS',
          reason: '20-mile radius included (saves on travel fees)',
          savings: extraTravelFee - 25, // Cost difference
          confidence: 'medium'
        };
      }
    }

    // Many signers suggests loan documents
    if (documentCount > 10) {
      return {
        serviceId: 'LOAN_SIGNING',
        reason: 'Loan documents detected - flat rate regardless of document count',
        confidence: 'medium'
      };
    }

    return null;
  }, [documentCount, urgency, timePreference, distance]);

  // Enhanced service options with dynamic badges and pricing
  const enhancedServices = useMemo(() => {
    return SERVICES.map(service => {
      let enhancedService = { ...service };
      
      // Add distance-based travel fee estimation
      if (distance > service.includedRadius) {
        const travelFee = (distance - service.includedRadius) * 0.50;
        enhancedService.price = service.price + travelFee;
      }

      // Dynamic badge assignment
      if (smartRecommendation?.serviceId === service.id) {
        enhancedService.badge = 'recommended';
        enhancedService.savings = smartRecommendation.savings;
      }

      // Urgency indicators
      if (urgency === 'today') {
        if (service.id === 'RON_SERVICES') {
          enhancedService.urgencyText = 'Available now';
        } else if (service.id === 'EXTENDED_HOURS') {
          enhancedService.urgencyText = 'Same-day guaranteed';
        } else if (service.id === 'STANDARD_NOTARY') {
          const currentHour = new Date().getHours();
          enhancedService.urgencyText = currentHour < 15 ? 'Same-day available' : 'Call for availability';
        }
      }

      return enhancedService;
    });
  }, [distance, smartRecommendation, urgency]);

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case 'popular': return 'default';
      case 'recommended': return 'destructive';
      case 'urgent': return 'secondary';
      case 'value': return 'outline';
      default: return 'secondary';
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case 'popular': return 'Most Popular';
      case 'recommended': return 'Recommended';
      case 'urgent': return 'Urgent';
      case 'value': return 'Best Value';
      default: return '';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trust Signals Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {TRUST_SIGNALS.map((signal, index) => (
            <div key={index} className="flex items-center space-x-2">
              <signal.icon className={`h-4 w-4 ${signal.color}`} />
              <span className={`font-medium ${signal.color}`}>
                {signal.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Recommendation Alert */}
      {smartRecommendation && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Smart Recommendation:</strong> {smartRecommendation.reason}
              {smartRecommendation.savings && smartRecommendation.savings > 0 && (
                <span className="text-green-600 font-medium ml-2">
                  (Save ${smartRecommendation.savings.toFixed(2)})
                </span>
              )}
            </div>
            {smartRecommendation.urgency && (
              <Badge variant="secondary" className="ml-2">
                {smartRecommendation.urgency}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Service Selection */}
      <RadioGroup 
        value={selectedService} 
        onValueChange={onServiceSelect}
        className="grid gap-4 md:grid-cols-2"
      >
        {enhancedServices.map((service) => {
          const isSelected = selectedService === service.id;
          const isHovered = hoveredService === service.id;
          const isRecommended = smartRecommendation?.serviceId === service.id;
          
          return (
            <div key={service.id} className="relative">
              <Label
                htmlFor={service.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <Card className={`transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' 
                    : isHovered 
                      ? 'shadow-md border-gray-300' 
                      : 'shadow-sm hover:shadow-md'
                } ${isRecommended ? 'border-green-400 bg-green-50' : ''}`}>
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={service.id} 
                          id={service.id}
                          className="mt-1"
                        />
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span className="text-lg">{service.name}</span>
                            {service.badge && (
                              <Badge variant={getBadgeVariant(service.badge)}>
                                {getBadgeText(service.badge)}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${service.price}
                        </div>
                        {service.savings && service.savings > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ${service.savings.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {service.urgencyText && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600">
                          {service.urgencyText}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Service Hours */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{service.hours}</span>
                    </div>

                    {/* Included Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">What's Included:</h4>
                      <ul className="space-y-1">
                        {service.included.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Distance/Travel Info */}
                    {distance > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">
                              {distance.toFixed(1)} miles from you
                            </span>
                          </div>
                          {distance > service.includedRadius && (
                            <span className="text-orange-600 font-medium">
                              +${((distance - service.includedRadius) * 0.50).toFixed(2)} travel
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Count Validation */}
                    {documentCount > service.maxDocuments && service.maxDocuments < 999 && (
                      <Alert className="mt-3 p-2 border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          You have {documentCount} documents. This service includes up to {service.maxDocuments}.
                          Consider upgrading to Extended Hours.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Service Comparison Toggle */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm"
        >
          {showComparison ? 'Hide' : 'Show'} Service Comparison
        </Button>
      </div>

      {/* Service Comparison Table */}
      {showComparison && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Service Comparison</CardTitle>
            <CardDescription>
              Compare all our services to find the perfect fit for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4">Feature</th>
                    {SERVICES.map(service => (
                      <th key={service.id} className="text-center py-2 px-2 min-w-[120px]">
                        {service.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 pr-4 font-medium">Price</td>
                    {SERVICES.map(service => (
                      <td key={service.id} className="text-center py-2 px-2 font-semibold text-green-600">
                        ${service.price}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Hours</td>
                    {SERVICES.map(service => (
                      <td key={service.id} className="text-center py-2 px-2 text-xs">
                        {service.hours}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Max Documents</td>
                    {SERVICES.map(service => (
                      <td key={service.id} className="text-center py-2 px-2">
                        {service.maxDocuments === 999 ? 'Unlimited' : service.maxDocuments}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Travel Radius</td>
                    {SERVICES.map(service => (
                      <td key={service.id} className="text-center py-2 px-2">
                        {service.includedRadius === 0 ? 'N/A' : `${service.includedRadius} miles`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Same Day</td>
                    {SERVICES.map(service => (
                      <td key={service.id} className="text-center py-2 px-2">
                        {service.id === 'STANDARD_NOTARY' ? '✓ (before 3pm)' :
                         service.id === 'EXTENDED_HOURS' ? '✓ Guaranteed' :
                         service.id === 'RON_SERVICES' ? '✓ Immediate' :
                         '✓ By appointment'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>Need Help Choosing?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Standard Notary:</strong> Perfect for 1-2 routine documents during business hours
            </div>
            <div>
              <strong>Extended Hours:</strong> Best for multiple documents, evening appointments, or urgent needs
            </div>
            <div>
              <strong>Loan Signing:</strong> Specialized for mortgage, refinance, and real estate documents
            </div>
            <div>
              <strong>Remote Online:</strong> Convenient digital notarization from anywhere, anytime
            </div>
          </div>
          <Separator className="my-3" />
          <div className="text-xs text-gray-600">
            Still unsure? Call us at (713) 234-5678 for personalized recommendations.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}