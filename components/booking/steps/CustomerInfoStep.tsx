'use client';

/**
 * 🚀 MOBILE-OPTIMIZED CUSTOMER INFO STEP
 * Houston Mobile Notary Pros
 * 
 * Enhanced UX with mobile-first design, better validation,
 * and conversion-optimized form elements
 */

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage, safeGet } from '@/lib/utils/error-utils';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Zap,
  Star
} from 'lucide-react';
import { InFlowQuoteCard } from '@/components/lead-capture/InFlowQuoteCard';

interface CustomerInfoStepProps {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  serviceType?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  currentStep?: number;
  onUpdate?: (updates: any) => void;
  errors?: any;
  pricing?: any;
}

export default function CustomerInfoStep({ 
  customer = {}, 
  serviceType,
  location,
  currentStep,
  onUpdate, 
  errors, 
  pricing 
}: CustomerInfoStepProps) {
  const { register, setValue, watch, formState: { errors: formErrors } } = useFormContext();
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Watch form values
  const watchedName = watch('customer.name') || customer.name || '';
  const watchedEmail = watch('customer.email') || customer.email || '';
  const watchedPhone = watch('customer.phone') || customer.phone || '';
  const watchedServiceType = watch('serviceType') || serviceType;
  const watchedLocation = watch('location') || location;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced input handlers with validation
  const handleInputChange = (field: string, value: string) => {
    setValue(`customer.${field}`, value);
    setValidationMessage(null);
    
    // Trigger update callback
    onUpdate?.({
      customer: {
        ...customer,
        [field]: value
      }
    });
  };

  // Email validation with real-time feedback
  const validateEmail = async (email: string) => {
    if (!email) return;
    
    setIsValidating(true);
    setValidationMessage(null);
    
    try {
      // Simulate email validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setValidationMessage('Please enter a valid email address');
      } else {
        setValidationMessage('✅ Email looks good!');
      }
    } catch (error) {
      setValidationMessage('Email validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const hasErrors = errors?.customer || formErrors?.customer;
  const isComplete = watchedName && watchedEmail;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 🚀 MOBILE-OPTIMIZED HEADER */}
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {isMobile ? 'Your Contact Info' : 'Tell Us About Yourself'}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {isMobile 
            ? 'We\'ll use this to confirm your booking'
            : 'We\'ll use this information to confirm your appointment and send you important updates'
          }
        </p>
      </div>

      {/* 🚀 TRUST INDICATORS */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2">
        <Badge variant="secondary" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Secure & Private
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Instant Confirmation
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Star className="h-3 w-3 mr-1" />
          Trusted by 10k+ Customers
        </Badge>
      </div>

      {/* 🚀 MAIN FORM CARD */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="customer.name" className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Full Name *
              </Label>
              <Input
                id="customer.name"
                placeholder={isMobile ? "Your name" : "Enter your full legal name"}
                value={watchedName}
                className={`h-12 md:h-10 ${
                  safeGet(errors, 'customer.name', null) || safeGet(formErrors, 'customer.name', null)
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                {...register('customer.name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />
              {(safeGet(errors, 'customer.name', null) || safeGet(formErrors, 'customer.name', null)) && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{getErrorMessage(safeGet(errors, 'customer.name', null)) || getErrorMessage(safeGet(formErrors, 'customer.name', null))}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="customer.email" className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                Email Address *
              </Label>
              <div className="relative">
                <Input
                  id="customer.email"
                  type="email"
                  placeholder={isMobile ? "your@email.com" : "Enter your email address"}
                  value={watchedEmail}
                  className={`h-12 md:h-10 pr-10 ${
                    safeGet(errors, 'customer.email', null) || safeGet(formErrors, 'customer.email', null)
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  {...register('customer.email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {watchedEmail && !isValidating && !safeGet(errors, 'customer.email', null) && !safeGet(formErrors, 'customer.email', null) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {(safeGet(errors, 'customer.email', null) || safeGet(formErrors, 'customer.email', null)) && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{getErrorMessage(safeGet(errors, 'customer.email', null)) || getErrorMessage(safeGet(formErrors, 'customer.email', null))}</span>
                </div>
              )}
              {validationMessage && !safeGet(errors, 'customer.email', null) && !safeGet(formErrors, 'customer.email', null) && (
                <div className={`flex items-center space-x-1 text-sm ${
                  validationMessage.includes('✅') ? 'text-green-600' : 'text-orange-600'
                }`}>
                  <span>{validationMessage}</span>
                </div>
              )}
            </div>

            {/* Phone Field - Optional */}
            <div className="space-y-2">
              <Label htmlFor="customer.phone" className="text-sm font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                Phone Number <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="customer.phone"
                type="tel"
                placeholder={isMobile ? "(555) 123-4567" : "Enter your phone number (optional)"}
                value={watchedPhone}
                className="h-12 md:h-10 border-gray-300 focus:border-blue-500"
                {...register('customer.phone')}
              />
              <p className="text-xs text-gray-500">
                We'll only call for urgent updates or appointment changes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 COMPLETION STATUS */}
      <Card className={`border-2 transition-all duration-300 ${
        isComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm font-medium ${
                isComplete ? 'text-green-800' : 'text-gray-600'
              }`}>
                Contact Information
              </span>
            </div>
            <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs">
              {isComplete ? 'Complete' : 'Required'}
            </Badge>
          </div>
          {isComplete && (
            <p className="text-xs text-green-700 mt-2">
              ✅ We'll send your booking confirmation to {watchedEmail}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 🚀 IN-FLOW QUOTE CARD - Lead Capture Mid-Booking */}
      {(watchedName || watchedEmail || watchedPhone) && (
        <InFlowQuoteCard
          bookingData={{
            name: watchedName,
            email: watchedEmail,
            phone: watchedPhone,
            serviceType: watchedServiceType,
            currentStep: currentStep || 2,
            location: watchedLocation,
          }}
          className="my-6"
        />
      )}

      {/* 🚀 MOBILE-OPTIMIZED TIPS */}
      {isMobile && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Quick Tips
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use your legal name as it appears on your ID</li>
                  <li>• We'll send confirmation to your email</li>
                  <li>• Phone is optional but helpful for urgent updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🚀 ERROR SUMMARY */}
      {hasErrors && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Please fix the errors above to continue with your booking.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}