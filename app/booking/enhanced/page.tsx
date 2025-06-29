"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, DollarSign, Calendar, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  key: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  typeLabel: string;
}

interface ServiceResponse {
  success: boolean;
  services: {
    all: Service[];
    byType: Record<string, Service[]>;
    typeLabels: Record<string, string>;
  };
  meta: {
    totalServices: number;
    serviceTypes: string[];
  };
}

const STEPS = [
  { id: 1, title: 'Select Service', description: 'Choose your notary service type' },
  { id: 2, title: 'Pick Time', description: 'Select appointment date & time' },
  { id: 3, title: 'Contact Info', description: 'Provide your contact details' },
  { id: 4, title: 'Location', description: 'Specify service location' },
  { id: 5, title: 'Review & Pay', description: 'Confirm and complete booking' },
];

export default function EnhancedBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    scheduledDateTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    locationType: 'CLIENT_SPECIFIED_ADDRESS',
    addressStreet: '',
    addressCity: '',
    addressState: 'TX',
    addressZip: '',
    notes: '',
  });

  useEffect(() => {
    fetchServices();
    
    // Pre-select service if provided in URL
    const serviceParam = searchParams?.get('service');
    if (serviceParam) {
      // Will be handled after services are loaded
    }
  }, [searchParams]);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch('/api/services-compatible');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data: ServiceResponse = await response.json();
      
      if (!data.success || !data.services?.all) {
        throw new Error('Invalid services response');
      }
      
      setServices(data.services.all);
      
      // Pre-select service if provided in URL
      const serviceParam = searchParams?.get('service');
      if (serviceParam) {
        const service = data.services.all.find(s => s.key === serviceParam);
        if (service) {
          setSelectedService(service);
          setBookingData(prev => ({ ...prev, serviceId: service.id }));
        }
      }
      
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error Loading Services',
        description: 'Could not load service options. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setBookingData(prev => ({ ...prev, serviceId: service.id }));
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Booking Experience</h1>
          </div>
          <p className="text-lg text-gray-600">Professional notary services with real-time pricing and instant booking</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                  currentStep >= step.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Select Your Service
                  </CardTitle>
                </CardHeader>
                
                {servicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading services...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {services.map((service) => (
                      <Card 
                        key={service.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedService?.id === service.id ? 'ring-2 ring-indigo-600' : ''
                        }`}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <Badge variant="secondary">${service.price}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration}min
                            </div>
                            {service.requiresDeposit && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${service.depositAmount} deposit
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && selectedService && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pick Your Time
                  </CardTitle>
                </CardHeader>
                
                <Alert className="mb-4">
                  <AlertDescription>
                    Selected Service: <strong>{selectedService.name}</strong> - ${selectedService.price}
                  </AlertDescription>
                </Alert>

                <div className="text-center py-8">
                  <p className="text-gray-600">Calendar integration coming soon...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    For now, please call us at (713) 936-4211 to schedule your appointment.
                  </p>
                  <Button 
                    onClick={handleNextStep} 
                    className="mt-4"
                    variant="outline"
                  >
                    Continue with Mock Booking <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <div className="text-center py-8">
                  <p className="text-gray-600">Contact form integration coming soon...</p>
                  <Button onClick={handleNextStep} className="mt-4" variant="outline">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Service Location
                  </CardTitle>
                </CardHeader>
                <div className="text-center py-8">
                  <p className="text-gray-600">Location selection coming soon...</p>
                  <Button onClick={handleNextStep} className="mt-4" variant="outline">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && selectedService && (
              <div>
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Review & Complete Booking</CardTitle>
                </CardHeader>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedService.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">${selectedService.price}</span>
                      </div>
                      {selectedService.requiresDeposit && (
                        <div className="flex justify-between">
                          <span>Deposit Required:</span>
                          <span className="font-medium">${selectedService.depositAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      This is a demonstration of the enhanced booking flow. 
                      To complete an actual booking, please use our <Button 
                        variant="link" 
                        className="p-0 h-auto text-indigo-600"
                        onClick={() => router.push('/booking')}
                      >
                        standard booking form
                      </Button> or call us at (713) 936-4211.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            onClick={handlePrevStep} 
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button 
              onClick={handleNextStep}
              disabled={currentStep === 1 && !selectedService}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => router.push('/booking')}>
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}