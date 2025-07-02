'use client';

/**
 * Championship Booking System - Review & Confirmation Step
 * Houston Mobile Notary Pros
 * 
 * Final confirmation step with payment processing, terms acceptance,
 * and conversion optimization. The championship closer.
 */

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CheckCircle, 
  CreditCard, 
  Shield, 
  Star, 
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  DollarSign,
  Zap,
  Lock,
  Gift,
  Phone,
  Mail,
  Building
} from 'lucide-react';

import { CreateBooking } from '@/lib/booking-validation';

interface ReviewStepProps {
  data: Partial<CreateBooking>;
  onUpdate: (updates: any) => void;
  errors?: any;
  pricing?: any;
  isSubmitting?: boolean;
  completedBooking?: any;
}

const PAYMENT_METHODS = [
  {
    id: 'credit-card',
    title: 'Credit or Debit Card',
    description: 'Secure payment via Stripe',
    icon: CreditCard,
    popular: true,
    fee: 0
  },
  {
    id: 'cash',
    title: 'Cash at Appointment',
    description: 'Pay when we arrive (exact change)',
    icon: DollarSign,
    popular: false,
    fee: 0,
    note: 'Must pay deposit online'
  }
];

const GUARANTEES = [
  {
    icon: Shield,
    title: '$100K E&O Insurance',
    description: 'Your documents are fully protected'
  },
  {
    icon: Clock,
    title: 'On-Time Guarantee',
    description: 'Arrive within 15 minutes or $25 credit'
  },
  {
    icon: Star,
    title: '30-Day Satisfaction',
    description: 'Full refund if not completely satisfied'
  },
  {
    icon: Lock,
    title: 'Secure & Confidential',
    description: 'Bank-level security for all transactions'
  }
];

export default function ReviewStep({ 
  data, 
  onUpdate, 
  errors, 
  pricing, 
  isSubmitting = false, 
  completedBooking 
}: ReviewStepProps) {
  const { setValue, watch } = useFormContext<CreateBooking>();
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  const watchedPayment = watch('payment') || {};
  const watchedServiceType = watch('serviceType');
  const watchedCustomer = watch('customer') || {};
  const watchedLocation = watch('location');
  const watchedScheduling = watch('scheduling') || {};

  useEffect(() => {
    // Auto-select credit card as default
    if (!watchedPayment.paymentMethod) {
      setValue('payment.paymentMethod', 'credit-card');
      onUpdate({ payment: { ...watchedPayment, paymentMethod: 'credit-card' } });
    }
  }, [watchedPayment.paymentMethod, setValue, onUpdate, watchedPayment]);

  const handlePaymentMethodChange = (method: string) => {
    setValue('payment.paymentMethod', method);
    onUpdate({ payment: { ...watchedPayment, paymentMethod: method } });
  };

  const handlePaymentOptionChange = (field: string, value: any) => {
    setValue(`payment.${field}` as any, value);
    onUpdate({ payment: { ...watchedPayment, [field]: value } });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    // Mock promo code application
    const commonCodes: Record<string, number> = {
      'WELCOME15': 15,
      'NEWCLIENT': 20,
      'SAVE10': 10
    };
    
    if (commonCodes[promoCode.toUpperCase()]) {
      setPromoApplied(true);
      setValue('promoCode', promoCode.toUpperCase());
      onUpdate({ promoCode: promoCode.toUpperCase() });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // If booking is completed, show success
  if (completedBooking) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-green-700 mb-4">
              Your appointment has been successfully scheduled.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-lg font-bold text-gray-900">
                Booking #{completedBooking.bookingNumber}
              </div>
              <div className="text-gray-600">
                Confirmation sent to {watchedCustomer.email}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Resend Confirmation
              </Button>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>Review Your Booking</span>
          </CardTitle>
          <CardDescription>
            Please review all details before confirming your appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Service Details</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Type:</span>
                    <span className="font-medium">
                      {watchedServiceType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Documents:</span>
                    <span className="font-medium">{data.serviceDetails?.documentCount || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Signers:</span>
                    <span className="font-medium">{data.serviceDetails?.signerCount || 1}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4" />
                  <span>Contact Information</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{watchedCustomer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{watchedCustomer.email}</span>
                  </div>
                  {watchedCustomer.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="font-medium">{watchedCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Appointment Time</span>
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {watchedScheduling.preferredDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formatDate(watchedScheduling.preferredDate)}
                      </span>
                    </div>
                  )}
                  {watchedScheduling.preferredTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="font-medium">
                        {formatTime(watchedScheduling.preferredTime)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {watchedScheduling.estimatedDuration || 60} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              {watchedServiceType !== 'RON_SERVICES' && watchedLocation && (
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>Service Location</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm">
                      {watchedLocation.address}<br />
                      {watchedLocation.city}, {watchedLocation.state} {watchedLocation.zipCode}
                    </div>
                    {watchedLocation.accessInstructions && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Access:</strong> {watchedLocation.accessInstructions}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      {pricing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Pricing Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pricing.breakdown?.lineItems?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.description}</span>
                  <span className={`font-medium ${
                    item.amount < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  ${pricing.total.toFixed(2)}
                </span>
              </div>
              
              {pricing.confidence?.competitiveAdvantage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800 font-medium">
                    💰 {pricing.confidence.competitiveAdvantage}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <span>Promo Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              disabled={promoApplied}
            />
            <Button 
              variant="outline" 
              onClick={applyPromoCode}
              disabled={promoApplied || !promoCode.trim()}
            >
              {promoApplied ? 'Applied' : 'Apply'}
            </Button>
          </div>
          {promoApplied && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Promo code applied successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Payment Method</span>
          </CardTitle>
          <CardDescription>
            Choose how you'd like to pay for your appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={watchedPayment.paymentMethod} 
            onValueChange={handlePaymentMethodChange}
            className="space-y-3"
          >
            {PAYMENT_METHODS.map((method) => (
              <div key={method.id} className="relative">
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <Label
                  htmlFor={method.id}
                  className="cursor-pointer block"
                >
                  <Card className={`transition-all duration-200 ${
                    watchedPayment.paymentMethod === method.id 
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <method.icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{method.title}</span>
                              {method.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {method.description}
                            </div>
                            {method.note && (
                              <div className="text-xs text-orange-600 mt-1">
                                {method.note}
                              </div>
                            )}
                          </div>
                        </div>
                        {method.fee > 0 && (
                          <span className="text-sm text-gray-600">
                            +${method.fee.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Payment Options */}
          {pricing && pricing.total > 100 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium">Payment Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="deposit" 
                    id="payment-deposit"
                    checked={!watchedPayment.payFullAmount}
                    onClick={() => handlePaymentOptionChange('payFullAmount', false)}
                  />
                  <Label htmlFor="payment-deposit" className="text-sm">
                    Pay 50% deposit now (${(pricing.total * 0.5).toFixed(2)}), 
                    balance at appointment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="full" 
                    id="payment-full"
                    checked={watchedPayment.payFullAmount}
                    onClick={() => handlePaymentOptionChange('payFullAmount', true)}
                  />
                  <Label htmlFor="payment-full" className="text-sm">
                    Pay full amount now (${pricing.total.toFixed(2)})
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms and Agreements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Terms & Guarantees</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guarantees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GUARANTEES.map((guarantee, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <guarantee.icon className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{guarantee.title}</div>
                  <div className="text-xs text-gray-600">{guarantee.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms-accepted"
                checked={termsAccepted}
                onCheckedChange={setTermsAccepted}
                className="mt-1"
              />
              <Label htmlFor="terms-accepted" className="text-sm leading-relaxed">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
                . I understand the cancellation policy and service guarantee.
              </Label>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing-consent"
                checked={watchedCustomer.marketingConsent || false}
                onCheckedChange={(checked) => {
                  setValue('customer.marketingConsent', checked);
                  onUpdate({ customer: { ...watchedCustomer, marketingConsent: checked } });
                }}
                className="mt-1"
              />
              <Label htmlFor="marketing-consent" className="text-sm leading-relaxed">
                Send me helpful notary tips and special offers (optional)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">
                Secure Booking - Your Information is Protected
              </span>
            </div>
            
            <div className="text-sm text-green-700">
              Complete your booking in one click. We'll send confirmation and appointment details immediately.
            </div>
            
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
              disabled={!termsAccepted || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Confirm Booking & Pay</span>
                </div>
              )}
            </Button>
            
            <div className="text-xs text-gray-600">
              You'll receive confirmation via email and SMS
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Footer */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">
          Questions about your booking?
        </div>
        <Button variant="outline" size="sm">
          <Phone className="h-4 w-4 mr-2" />
          Call (713) 234-5678
        </Button>
      </div>
    </div>
  );
}