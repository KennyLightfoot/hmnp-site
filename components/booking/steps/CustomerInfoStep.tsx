'use client';

/**
 * Championship Booking System - Customer Information Step
 * Houston Mobile Notary Pros
 * 
 * Customer contact details collection with trust building,
 * social proof, and conversion optimization.
 */

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Lock, 
  Star, 
  CheckCircle,
  Info,
  Users,
  MessageSquare
} from 'lucide-react';

import { CreateBooking } from '@/lib/booking-validation';

interface CustomerInfoStepProps {
  data: Partial<CreateBooking>;
  onUpdate: (updates: any) => void;
  errors?: any;
}

const TRUST_INDICATORS = [
  {
    icon: Shield,
    title: 'Privacy Protected',
    description: 'Your information is encrypted and never shared',
    color: 'text-green-600'
  },
  {
    icon: Lock,
    title: 'Secure Processing',
    description: 'SSL encrypted with bank-level security',
    color: 'text-blue-600'
  },
  {
    icon: Star,
    title: 'Trusted by 2,000+',
    description: 'Join thousands of satisfied customers',
    color: 'text-yellow-600'
  }
];

const RECENT_REVIEWS = [
  {
    name: 'Sarah M.',
    location: 'Heights',
    rating: 5,
    comment: 'Professional service, arrived exactly on time. Made the whole process so easy!',
    timeAgo: '2 hours ago'
  },
  {
    name: 'Michael R.',
    location: 'Katy',
    rating: 5,
    comment: 'Excellent communication and very knowledgeable. Will definitely use again.',
    timeAgo: '5 hours ago'
  },
  {
    name: 'Jennifer L.',
    location: 'Sugar Land',
    rating: 5,
    comment: 'Quick booking process and fair pricing. Highly recommend!',
    timeAgo: '1 day ago'
  }
];

export default function CustomerInfoStep({ data, onUpdate, errors }: CustomerInfoStepProps) {
  const { register, setValue, watch } = useFormContext<CreateBooking>();
  const [showReviews, setShowReviews] = useState(false);
  
  const watchedCustomer = watch('customer') || {};
  const watchedServiceType = watch('serviceType');

  const handleInputChange = (field: string, value: any) => {
    setValue(`customer.${field}` as any, value);
    onUpdate({ customer: { ...watchedCustomer, [field]: value } });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Trust Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900">
            Your Information is Safe & Secure
          </h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            SSL Protected
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_INDICATORS.map((indicator, index) => (
            <div key={index} className="flex items-start space-x-3">
              <indicator.icon className={`h-5 w-5 ${indicator.color} mt-0.5`} />
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {indicator.title}
                </div>
                <div className="text-xs text-gray-600">
                  {indicator.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
              <CardDescription>
                We'll use this information to confirm your appointment and send updates
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="customer.name" className="text-sm font-medium flex items-center space-x-1">
                  <span>Full Name</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer.name"
                  placeholder="Enter your full name"
                  value={watchedCustomer.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors?.customer?.name ? 'border-red-500' : ''}
                />
                {errors?.customer?.name && (
                  <p className="text-sm text-red-600">{errors.customer.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="customer.email" className="text-sm font-medium flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customer.email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={watchedCustomer.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors?.customer?.email ? 'border-red-500' : ''}
                />
                {errors?.customer?.email && (
                  <p className="text-sm text-red-600">{errors.customer.email.message}</p>
                )}
                <p className="text-xs text-gray-600">
                  📧 Booking confirmation and appointment reminders will be sent here
                </p>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="customer.phone" className="text-sm font-medium flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                  <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="customer.phone"
                  type="tel"
                  placeholder="(713) 234-5678"
                  value={watchedCustomer.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  📱 For urgent appointment updates and day-of coordination
                </p>
              </div>

              {/* Company Name (for business clients) */}
              {(watchedServiceType === 'LOAN_SIGNING' || watchedCustomer.companyName !== undefined) && (
                <div className="space-y-2">
                  <Label htmlFor="customer.companyName" className="text-sm font-medium flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>Company Name</span>
                    <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="customer.companyName"
                    placeholder="Your company or organization"
                    value={watchedCustomer.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
              )}

              {/* Preferred Contact Method */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Preferred Contact Method
                </Label>
                <RadioGroup
                  value={watchedCustomer.preferredContactMethod || 'email'}
                  onValueChange={(value) => handleInputChange('preferredContactMethod', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact-email" />
                    <Label htmlFor="contact-email" className="text-sm">
                      📧 Email (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="contact-phone" />
                    <Label htmlFor="contact-phone" className="text-sm">
                      📞 Phone Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="contact-sms" />
                    <Label htmlFor="contact-sms" className="text-sm">
                      💬 Text Message
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium">
                  Communication Preferences
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-consent"
                      checked={watchedCustomer.smsConsent || false}
                      onCheckedChange={(checked) => handleInputChange('smsConsent', checked)}
                    />
                    <Label htmlFor="sms-consent" className="text-sm">
                      Send appointment reminders via text message
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing-consent"
                      checked={watchedCustomer.marketingConsent || false}
                      onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
                    />
                    <Label htmlFor="marketing-consent" className="text-sm">
                      Receive helpful tips and special offers (optional)
                    </Label>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600">
                  You can unsubscribe at any time. We never share your information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof Sidebar */}
        <div className="space-y-4">
          {/* Customer Count */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">487</div>
                <div className="text-sm text-green-600 font-medium">
                  Customers served this month
                </div>
                <div className="flex items-center justify-center mt-2 space-x-1">
                  {renderStars(5)}
                  <span className="text-sm text-green-700 ml-2">4.9/5 Rating</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews Toggle */}
          <Card>
            <CardContent className="p-4">
              <Button
                variant="outline"
                onClick={() => setShowReviews(!showReviews)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{showReviews ? 'Hide' : 'Read'} Recent Reviews</span>
              </Button>
              
              {showReviews && (
                <div className="mt-4 space-y-3">
                  {RECENT_REVIEWS.map((review, index) => (
                    <div key={index} className="border-l-2 border-green-200 pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{review.name}</div>
                        <div className="text-xs text-gray-500">{review.timeAgo}</div>
                      </div>
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-600">• {review.location}</span>
                      </div>
                      <p className="text-xs text-gray-700 italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Why We Need This Info */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-blue-900">Why we collect this information:</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Appointment confirmation & reminders</li>
                  <li>• Day-of coordination & updates</li>
                  <li>• Receipt and documentation delivery</li>
                  <li>• Emergency contact if needed</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Guarantee */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-semibold text-yellow-900 mb-1">
                30-Day Satisfaction Guarantee
              </div>
              <div className="text-sm text-yellow-800">
                Not satisfied with our service? Full refund, no questions asked.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Help Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              <strong>Need assistance?</strong> Our team is here to help with your booking.
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call (713) 234-5678
          </Button>
        </div>
      </div>
    </div>
  );
}