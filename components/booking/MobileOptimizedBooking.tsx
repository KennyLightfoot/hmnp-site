"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, Users, FileText, Settings, Calendar, MapPin, 
  ChevronLeft, ChevronRight, Check, Menu, X, Plus, Minus,
  Navigation, Phone, Mail, Clock, Zap
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface MobileBookingStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  required: boolean;
}

interface MobileOptimizedBookingProps {
  onBookingSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

// Mobile-optimized input component
const MobileInput = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "",
  required = false,
  icon: Icon,
  ...props 
}: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-12 text-base ${Icon ? 'pl-11' : ''} border-2 focus:border-blue-500`}
          {...props}
        />
      </div>
    </div>
  );
};

// Mobile stepper component
const MobileStepper = ({ 
  currentStep, 
  totalSteps, 
  onStepChange, 
  steps 
}: {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  steps: MobileBookingStep[];
}) => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="font-semibold text-lg">{steps[currentStep]?.title}</h2>
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={currentStep === totalSteps - 1}
          className="p-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <Progress 
        value={((currentStep + 1) / totalSteps) * 100} 
        className="h-2"
      />
    </div>
  );
};

// Mobile-optimized service selection
const MobileServiceSelection = ({ selectedService, onServiceChange, services }: any) => {
  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Choose Your Service</h3>
        <p className="text-gray-600">Select the notary service you need</p>
      </div>
      
      <div className="space-y-3">
        {services.map((service: any) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all active:scale-95 ${
              selectedService?.id === service.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'border-2 active:border-blue-300'
            }`}
            onClick={() => onServiceChange(service)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{service.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.duration} min
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${service.price}</p>
                  {service.requiresDeposit && (
                    <p className="text-xs text-gray-500">${service.depositAmount} deposit</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Mobile-optimized signer management
const MobileSignerManagement = ({ signers, onSignersChange }: any) => {
  const addSigner = () => {
    onSignersChange([
      ...signers,
      {
        name: '',
        email: '',
        phone: '',
        role: signers.length === 0 ? 'PRIMARY' : 'SECONDARY',
        notificationPreference: 'EMAIL'
      }
    ]);
  };

  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      onSignersChange(signers.filter((_: any, i: number) => i !== index));
    }
  };

  const updateSigner = (index: number, field: string, value: any) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], [field]: value };
    onSignersChange(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Add Signers</h3>
        <p className="text-gray-600">Who will be signing the documents?</p>
      </div>

      <div className="space-y-4">
        {signers.map((signer: any, index: number) => (
          <Card key={index} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Signer {index + 1}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {signer.role}
                  </Badge>
                </CardTitle>
                {signers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSigner(index)}
                    className="text-red-600 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <MobileInput
                label="Full Name"
                value={signer.name}
                onChange={(e: any) => updateSigner(index, 'name', e.target.value)}
                placeholder="John Doe"
                required
                icon={Users}
              />
              
              <MobileInput
                label="Email Address"
                type="email"
                value={signer.email}
                onChange={(e: any) => updateSigner(index, 'email', e.target.value)}
                placeholder="john@example.com"
                required
                icon={Mail}
              />
              
              <MobileInput
                label="Phone Number"
                type="tel"
                value={signer.phone || ''}
                onChange={(e: any) => updateSigner(index, 'phone', e.target.value)}
                placeholder="(555) 123-4567"
                icon={Phone}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={addSigner}
        variant="outline"
        className="w-full h-12 text-base border-2 border-dashed border-gray-300 active:scale-95"
        disabled={signers.length >= 10}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Another Signer
      </Button>
    </div>
  );
};

// Mobile-optimized location input
const MobileLocationInput = ({ location, onLocationChange }: any) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding would go here
            // For now, just prompt user to enter address
            setUseCurrentLocation(false);
            alert('Please enter your address manually. GPS integration coming soon!');
          } catch (error) {
            setUseCurrentLocation(false);
            alert('Could not determine your location. Please enter manually.');
          }
        },
        () => {
          setUseCurrentLocation(false);
          alert('Location access denied. Please enter your address manually.');
        }
      );
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Service Location</h3>
        <p className="text-gray-600">Where should we meet you?</p>
      </div>

      <Button
        onClick={getCurrentLocation}
        variant="outline"
        className="w-full h-12 text-base border-2 active:scale-95"
        disabled={useCurrentLocation}
      >
        <Navigation className="h-5 w-5 mr-2" />
        {useCurrentLocation ? 'Getting Location...' : 'Use Current Location'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or enter manually</span>
        </div>
      </div>

      <div className="space-y-4">
        <MobileInput
          label="Street Address"
          value={location.addressStreet}
          onChange={(e: any) => onLocationChange({ ...location, addressStreet: e.target.value })}
          placeholder="123 Main St"
          required
          icon={MapPin}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <MobileInput
            label="City"
            value={location.addressCity}
            onChange={(e: any) => onLocationChange({ ...location, addressCity: e.target.value })}
            placeholder="Houston"
            required
          />
          
          <MobileInput
            label="ZIP Code"
            value={location.addressZip}
            onChange={(e: any) => onLocationChange({ ...location, addressZip: e.target.value })}
            placeholder="77001"
            required
          />
        </div>
      </div>
    </div>
  );
};

// Main mobile booking component
export default function MobileOptimizedBooking({
  onBookingSubmit,
  initialData = {}
}: MobileOptimizedBookingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    signers: [{
      name: '',
      email: '',
      phone: '',
      role: 'PRIMARY',
      notificationPreference: 'EMAIL'
    }],
    addressStreet: '',
    addressCity: '',
    addressState: 'TX',
    addressZip: '',
    scheduledDateTime: '',
    termsAccepted: false,
    ...initialData
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const steps: MobileBookingStep[] = [
    {
      id: 'service',
      title: 'Select Service',
      icon: Settings,
      component: MobileServiceSelection,
      required: true
    },
    {
      id: 'signers',
      title: 'Add Signers',
      icon: Users,
      component: MobileSignerManagement,
      required: true
    },
    {
      id: 'location',
      title: 'Location',
      icon: MapPin,
      component: MobileLocationInput,
      required: true
    },
    {
      id: 'datetime',
      title: 'Date & Time',
      icon: Calendar,
      component: () => <div>Calendar component</div>,
      required: true
    },
    {
      id: 'review',
      title: 'Review',
      icon: Check,
      component: () => <div>Review component</div>,
      required: true
    }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onBookingSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'service':
        return !!bookingData.serviceId;
      case 'signers':
        return bookingData.signers.length > 0 && 
               bookingData.signers.every(s => s.name && s.email);
      case 'location':
        return bookingData.addressStreet && bookingData.addressCity && bookingData.addressZip;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    const step = steps[currentStep];
    const StepComponent = step.component;
    
    switch (step.id) {
      case 'service':
        return (
          <MobileServiceSelection
            selectedService={bookingData.serviceId}
            onServiceChange={(service: any) => setBookingData({ ...bookingData, serviceId: service.id })}
            services={[]} // This would come from API
          />
        );
      case 'signers':
        return (
          <MobileSignerManagement
            signers={bookingData.signers}
            onSignersChange={(signers: any) => setBookingData({ ...bookingData, signers })}
          />
        );
      case 'location':
        return (
          <MobileLocationInput
            location={bookingData}
            onLocationChange={(location: any) => setBookingData({ ...bookingData, ...location })}
          />
        );
      default:
        return <StepComponent />;
    }
  };

  if (!isMobile) {
    return (
      <div className="text-center p-8">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">
          This mobile-optimized interface is designed for smaller screens.
          Please use the desktop booking wizard on larger devices.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Stepper */}
      <MobileStepper
        currentStep={currentStep}
        totalSteps={steps.length}
        onStepChange={setCurrentStep}
        steps={steps}
      />

      {/* Step Content */}
      <div className="pb-20">
        {renderCurrentStep()}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="w-full h-12 text-base bg-green-600 hover:bg-green-700 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Booking...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Complete Booking
              </>
            )}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
              className="h-12 text-base active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="h-12 text-base active:scale-95"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 