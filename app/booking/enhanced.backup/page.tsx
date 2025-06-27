'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Clock, DollarSign } from 'lucide-react';
import RealTimePricing from '@/components/booking/RealTimePricing';
import ServiceAreaMap from '@/components/booking/ServiceAreaMap';
import MultiStepForm from '@/components/booking/MultiStepForm';
import { toast } from 'react-hot-toast';

const STEPS = [
  { id: 1, name: 'Service Selection', status: 'current' },
  { id: 2, name: 'Location & Details', status: 'upcoming' },
  { id: 3, name: 'Date & Time', status: 'upcoming' },
  { id: 4, name: 'Review & Payment', status: 'upcoming' },
];

interface BookingData {
  serviceType: string;
  location: {
    street: string;
    city: string;
    state: string;
    zip: string;
    latitude?: number;
    longitude?: number;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  appointmentDateTime: string | null;
  numberOfSigners: number;
  documents: string[];
  specialInstructions: string;
  pricing: {
    basePrice: number;
    travelFee: number;
    totalPrice: number;
    mileage: number;
  };
}

export default function EnhancedBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceType: searchParams.get('service') || '',
    location: {
      street: '',
      city: '',
      state: 'TX',
      zip: '',
    },
    customerInfo: {
      name: '',
      email: '',
      phone: '',
    },
    appointmentDateTime: null,
    numberOfSigners: 1,
    documents: [],
    specialInstructions: '',
    pricing: {
      basePrice: 0,
      travelFee: 0,
      totalPrice: 0,
      mileage: 0,
    },
  });

  // Update step status based on current step
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const updateBookingData = (newData: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings/unified-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.serviceType,
          scheduledDateTime: bookingData.appointmentDateTime,
          email: bookingData.customerInfo.email,
          customerName: bookingData.customerInfo.name,
          phone: bookingData.customerInfo.phone,
          company: bookingData.customerInfo.company,
          addressStreet: bookingData.location.street,
          addressCity: bookingData.location.city,
          addressState: bookingData.location.state,
          addressZip: bookingData.location.zip,
          addressLatitude: bookingData.location.latitude?.toString(),
          addressLongitude: bookingData.location.longitude?.toString(),
          numberOfSigners: bookingData.numberOfSigners,
          notes: bookingData.specialInstructions,
          travelFee: bookingData.pricing.travelFee,
          travelMileage: bookingData.pricing.mileage,
          locationType: 'CLIENT_SPECIFIED_ADDRESS',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      if (result.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else {
        // Booking confirmed without payment
        router.push(`/booking/confirmation/${result.booking.id}`);
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Booking Experience
            </h1>
            <p className="mt-2 text-gray-600">
              Real-time pricing with Google Maps integration and service area geofencing
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-8">
            {STEPS.map((step, stepIdx) => (
              <li key={step.name} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      getStepStatus(step.id) === 'complete'
                        ? 'bg-blue-600 border-blue-600'
                        : getStepStatus(step.id) === 'current'
                        ? 'border-blue-600 bg-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {getStepStatus(step.id) === 'complete' ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          getStepStatus(step.id) === 'current'
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      getStepStatus(step.id) === 'current'
                        ? 'text-blue-600'
                        : getStepStatus(step.id) === 'complete'
                        ? 'text-gray-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {stepIdx < STEPS.length - 1 && (
                  <div className="ml-8 h-0.5 w-8 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MultiStepForm
                    currentStep={currentStep}
                    bookingData={bookingData}
                    updateBookingData={updateBookingData}
                    onNext={handleNext}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Pricing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Real-time Pricing
              </h3>
              <RealTimePricing
                serviceType={bookingData.serviceType}
                location={bookingData.location}
                numberOfSigners={bookingData.numberOfSigners}
                onPricingUpdate={(pricing) => updateBookingData({ pricing })}
              />
            </div>

            {/* Service Area Map */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Service Area
              </h3>
              <ServiceAreaMap
                serviceType={bookingData.serviceType}
                customerLocation={bookingData.location}
                onLocationUpdate={(location) => updateBookingData({ location })}
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Service:</span>
                  <span className="font-medium text-blue-900">
                    {bookingData.serviceType || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Signers:</span>
                  <span className="font-medium text-blue-900">
                    {bookingData.numberOfSigners}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Base Price:</span>
                  <span className="font-medium text-blue-900">
                    ${bookingData.pricing.basePrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Travel Fee:</span>
                  <span className="font-medium text-blue-900">
                    ${bookingData.pricing.travelFee}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-semibold">Total:</span>
                    <span className="font-bold text-blue-900 text-lg">
                      ${bookingData.pricing.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}