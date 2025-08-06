'use client';

/**
 * Championship Booking System - Service Selection Component
 * Houston Mobile Notary Pros
 * 
 * Conversion-optimized service selector with smart recommendations,
 * real-time pricing, and psychological triggers for higher conversions.
 * 
 * ✅ NEW: Mobile/Online (RON) service toggle for Phase 1
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Info,
  Car,
  Monitor,
  Smartphone,
  Globe,
  ArrowRight
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
  serviceType: 'mobile' | 'online';
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

// Service configuration matching the pricing engine - ALL 10 SERVICES
const SERVICES: ServiceOption[] = [
  // ===== CORE MOBILE SERVICES =====
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
    badge: 'value',
    serviceType: 'mobile'
  },
  {
    id: 'STANDARD_NOTARY',
    name: 'Standard Mobile Notary',
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
    badge: 'popular',
    serviceType: 'mobile'
  },
  {
    id: 'EXTENDED_HOURS',
    name: 'Extended Hours Mobile',
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
    badge: 'recommended',
    serviceType: 'mobile'
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
    badge: 'value',
    serviceType: 'mobile'
  },
  
  // ===== SPECIALIZED SERVICES =====
  {
    id: 'ESTATE_PLANNING',
    name: 'Estate Planning Package',
    price: 250,
    description: 'Comprehensive estate document notarization - Wills, Trusts, POAs, and more',
    hours: 'By appointment',
    included: [
      'Up to 10 documents',
      'Up to 4 signers',
      '2.5-hour session',
      'Estate planning expertise',
      'Multiple document types',
      '30-mile travel radius'
    ],
    maxDocuments: 10,
    includedRadius: 30,
    badge: 'value',
    serviceType: 'mobile'
  },
  {
    id: 'SPECIALTY_NOTARY',
    name: 'Specialty Notary Services',
    price: 150,
    description: 'Apostilles, embassy certifications, translations, and complex notarial acts',
    hours: 'By appointment',
    included: [
      'Complex documents',
      'Apostille services',
      'Embassy certifications',
      'Translation notarization',
      'Expert handling',
      '30-mile travel radius'
    ],
    maxDocuments: 5,
    includedRadius: 30,
    badge: 'recommended',
    serviceType: 'mobile'
  },
  {
    id: 'BUSINESS_SOLUTIONS',
    name: 'Business Notary Solutions',
    price: 250,
    description: 'Volume signings, block-booking discounts, corporate accounts, and recurring appointments',
    hours: 'Flexible scheduling',
    included: [
      'Volume discounts',
      'Corporate accounts',
      'Recurring appointments',
      'Block booking',
      'Dedicated support',
      '30-mile travel radius'
    ],
    maxDocuments: 999,
    includedRadius: 30,
    badge: 'value',
    serviceType: 'mobile'
  },
  
  // ===== REMOTE & SUBSCRIPTION SERVICES =====
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
    urgencyText: 'Available now',
    serviceType: 'online'
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
    badge: 'recommended',
    serviceType: 'online'
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
    badge: 'value',
    serviceType: 'online'
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
  const [serviceType, setServiceType] = useState<'mobile' | 'online'>('mobile');
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Filter services based on selected type
  const filteredServices = useMemo(() => {
    return SERVICES.filter(service => service.serviceType === serviceType);
  }, [serviceType]);

  // Smart recommendation engine (context-aware)
  const smartRecommendation = useMemo((): SmartRecommendation | null => {
    if (serviceType === 'online') {
      // RON recommendations
      if (urgency === 'today') {
        return {
          serviceId: 'RON_SERVICES',
          reason: 'Available immediately - no travel time needed',
          confidence: 'high',
          urgency: 'Ready now'
        };
      }
      
      if (documentCount > 10) {
        return {
          serviceId: 'BUSINESS_ESSENTIALS',
          reason: 'Monthly subscription saves money for multiple documents',
          confidence: 'medium'
        };
      }
      
      return {
        serviceId: 'RON_SERVICES',
        reason: 'Convenient and secure - no travel required',
        confidence: 'high'
      };
    }

    // Mobile service recommendations
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
      const standardCost = 75 + ((documentCount - 2) * 15);
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
          reason: '30-mile radius included (saves on travel fees)',
          savings: extraTravelFee - 25,
          confidence: 'medium'
        };
      }
    }

    // Loan document detection
    if (documentCount > 10) {
      return {
        serviceId: 'LOAN_SIGNING',
        reason: 'Loan documents detected - flat rate regardless of document count',
        confidence: 'medium'
      };
    }

    return null;
  }, [serviceType, documentCount, urgency, timePreference, distance]);

  // Enhanced service options with dynamic badges and pricing
  const enhancedServices = useMemo(() => {
    return filteredServices.map(service => {
      let enhancedService = { ...service };
      
      // Add distance-based travel fee estimation (only for mobile services)
      if (serviceType === 'mobile' && distance > service.includedRadius) {
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
  }, [filteredServices, serviceType, distance, smartRecommendation, urgency]);

  // Handle service type change
  const handleServiceTypeChange = (value: string) => {
    const newType = value as "mobile" | "online";
    setServiceType(newType);
    
    // Auto-select first service of new type if current selection is not compatible
    const currentService = SERVICES.find(s => s.id === selectedService);
    if (!currentService || currentService.serviceType !== newType) {
      const firstServiceOfType = SERVICES.find(s => s.serviceType === newType);
      if (firstServiceOfType) {
        onServiceSelect(firstServiceOfType.id);
      }
    }
  };

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
      {/* 🚀 NEW: Service Type Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Service Type</h3>
          <p className="text-sm text-gray-600">Select the type of notary service that works best for you</p>
        </div>
        
        <Tabs value={serviceType} onValueChange={handleServiceTypeChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-white shadow-sm">
            <TabsTrigger 
              value="mobile" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile Service</span>
              <span className="sm:hidden">Mobile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Online (RON)</span>
              <span className="sm:hidden">Online</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mobile" className="mt-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Mobile Notary Service</h4>
                  <p className="text-sm text-gray-600">A certified notary travels to your location</p>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li>• Notary comes to you (home, office, or chosen location)</li>
                    <li>• In-person document verification</li>
                    <li>• Travel fees may apply based on distance</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="online" className="mt-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Monitor className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Remote Online Notarization (RON)</h4>
                  <p className="text-sm text-gray-600">Secure video call with digital notarization</p>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li>• Available 24/7 from anywhere</li>
                    <li>• No travel time or fees</li>
                    <li>• Secure digital process via Proof.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
      <div className="grid gap-4 md:grid-cols-2">
        {enhancedServices.map((service) => {
          const isSelected = selectedService === service.id;
          const isHovered = hoveredService === service.id;
          const isRecommended = smartRecommendation?.serviceId === service.id;
          
          return (
            <div key={service.id} className="relative">
              <button
                type="button"
                onClick={() => onServiceSelect(service.id)}
                data-testid="service-option"
                className="w-full text-left cursor-pointer"
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
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
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
                    
                    {/* Urgency indicator */}
                    {service.urgencyText && (
                      <Badge variant="outline" className="absolute top-4 right-4 bg-orange-100 text-orange-800 border-orange-200">
                        <Zap className="h-3 w-3 mr-1" />
                        {service.urgencyText}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{service.hours}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          What's included:
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.included.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Service type indicator */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {service.serviceType === 'mobile' ? (
                            <>
                              <Car className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-600 font-medium">Mobile Service</span>
                            </>
                          ) : (
                            <>
                              <Monitor className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">Online Service</span>
                            </>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </button>
            </div>
          );
        })}
        </div>

      {/* Service Type Comparison */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Need help choosing?</h4>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </Button>
        </div>
        
        {showComparison && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Car className="h-5 w-5 text-blue-600" />
                <h5 className="font-medium text-blue-900">Mobile Service</h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>In-person service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Physical document handling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Traditional notarization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Travel time required</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Monitor className="h-5 w-5 text-green-600" />
                <h5 className="font-medium text-green-900">Online (RON)</h5>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Available 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No travel time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure digital process</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Immediate availability</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}