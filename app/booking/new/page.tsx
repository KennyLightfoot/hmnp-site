"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Calendar, User, CreditCard, CheckCircle } from 'lucide-react';
import BookingCalendar from '@/components/booking/BookingCalendar';
import BookingForm from '@/components/booking/BookingForm';
import PromoCodeInput from '@/components/booking/PromoCodeInput';
import PaymentForm from '@/components/booking/PaymentForm';
import { toast } from '@/components/ui/use-toast';
import { Suspense } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  basePrice: number;
  depositAmount: number;
}

const STEPS = [
  { id: 1, title: 'Select Service', icon: Calendar },
  { id: 2, title: 'Choose Date & Time', icon: Calendar },
  { id: 3, title: 'Contact Info', icon: User },
  { id: 4, title: 'Payment', icon: CreditCard },
  { id: 5, title: 'Confirmation', icon: CheckCircle },
];

function NewBookingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Load services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const servicesData = await response.json();
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services. Please refresh the page.',
        variant: 'destructive'
      });
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
              <CardDescription>
                Choose the notary service you need for your appointment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className="cursor-pointer transition-colors hover:border-blue-300"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-muted-foreground">Duration: </span>
                          <span>{service.durationMinutes} minutes</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${service.basePrice}</div>
                          <div className="text-sm text-muted-foreground">
                            ${service.depositAmount} deposit
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return selectedService ? (
          <BookingCalendar
            serviceId={selectedService.id}
            serviceDuration={selectedService.durationMinutes}
            onDateTimeSelect={(date, time) => {
              console.log('Selected:', date, time);
              // Handle date/time selection
            }}
          />
        ) : null;

      default:
        return <div>Step {currentStep} - Coming soon...</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Enhanced Booking System</h1>
        <p className="text-muted-foreground mt-2">
          Complete your booking in just a few simple steps
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs text-center ${isActive ? 'font-semibold' : ''}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
          disabled={currentStep >= 2 && !selectedService}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
      <NewBookingContent />
    </Suspense>
  );
} 