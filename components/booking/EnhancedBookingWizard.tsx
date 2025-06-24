"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, ChevronRight, Check, Users, FileText, 
  Settings, CreditCard, Calendar, MapPin, Clock 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Import our new Phase 1 components
import MultiSignerForm, { SignerInfo } from './MultiSignerForm';
import DocumentUpload, { BookingDocument } from './DocumentUpload';
import ServiceAddons, { SelectedAddon } from './ServiceAddons';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  serviceType: string;
  requiresDeposit: boolean;
  depositAmount: number;
}

interface EnhancedBookingData {
  // Service Selection
  serviceId: string;
  service?: Service;
  
  // Scheduling
  scheduledDateTime: string;
  locationType: 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE';
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationNotes?: string;
  
  // Multi-signer support
  signers: SignerInfo[];
  
  // Documents
  documents: BookingDocument[];
  
  // Add-ons
  selectedAddons: SelectedAddon[];
  
  // Additional details
  notes?: string;
  promoCode?: string;
  urgencyLevel: 'standard' | 'same-day' | 'emergency';
  
  // Consent
  termsAccepted: boolean;
  smsNotifications: boolean;
  emailUpdates: boolean;
}

const WIZARD_STEPS = [
  {
    id: 'service',
    title: 'Service Selection',
    description: 'Choose your notary service',
    icon: Settings,
    required: true
  },
  {
    id: 'signers',
    title: 'Signers & Participants', 
    description: 'Add all parties involved',
    icon: Users,
    required: true
  },
  {
    id: 'documents',
    title: 'Document Upload',
    description: 'Upload documents to be notarized',
    icon: FileText,
    required: false
  },
  {
    id: 'scheduling',
    title: 'Date & Location',
    description: 'Schedule your appointment',
    icon: Calendar,
    required: true
  },
  {
    id: 'addons',
    title: 'Service Add-ons',
    description: 'Customize your service',
    icon: Settings,
    required: false
  },
  {
    id: 'review',
    title: 'Review & Payment',
    description: 'Confirm and pay',
    icon: CreditCard,
    required: true
  }
];

interface EnhancedBookingWizardProps {
  onBookingSubmit: (bookingData: EnhancedBookingData) => Promise<void>;
  initialData?: Partial<EnhancedBookingData>;
  availableServices?: Service[];
}

export default function EnhancedBookingWizard({
  onBookingSubmit,
  initialData,
  availableServices = []
}: EnhancedBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>(availableServices);
  
  const [bookingData, setBookingData] = useState<EnhancedBookingData>({
    serviceId: '',
    scheduledDateTime: '',
    locationType: 'CLIENT_SPECIFIED_ADDRESS',
    addressStreet: '',
    addressCity: '',
    addressState: 'TX',
    addressZip: '',
    signers: [{
      name: '',
      email: '',
      phone: '',
      role: 'PRIMARY',
      notificationPreference: 'EMAIL'
    }],
    documents: [],
    selectedAddons: [],
    urgencyLevel: 'standard',
    termsAccepted: false,
    smsNotifications: true,
    emailUpdates: true,
    ...initialData
  });

  // Load services if not provided
  useEffect(() => {
    if (services.length === 0) {
      fetchServices();
    }
  }, [services.length]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast({
        title: "Error loading services",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
    }
  };

  const updateBookingData = (updates: Partial<EnhancedBookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const selectedService = services.find(s => s.id === bookingData.serviceId);

  const validateStep = (stepIndex: number): boolean => {
    const step = WIZARD_STEPS[stepIndex];
    
    switch (step.id) {
      case 'service':
        return !!bookingData.serviceId;
        
      case 'signers':
        return bookingData.signers.length > 0 && 
               bookingData.signers.every(s => s.name && s.email) &&
               bookingData.signers.filter(s => s.role === 'PRIMARY').length === 1;
               
      case 'documents':
        // Optional step - always valid
        return true;
        
      case 'scheduling':
        return !!bookingData.scheduledDateTime && 
               !!bookingData.addressStreet && 
               !!bookingData.addressCity;
               
      case 'addons':
        // Optional step - always valid
        return true;
        
      case 'review':
        return bookingData.termsAccepted;
        
      default:
        return true;
    }
  };

  const canProceed = () => {
    return validateStep(currentStep);
  };

  const nextStep = () => {
    if (canProceed() && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalPrice = () => {
    const servicePrice = selectedService?.price || 0;
    const addonsPrice = bookingData.selectedAddons.reduce((total, addon) => total + addon.totalPrice, 0);
    return servicePrice + addonsPrice;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onBookingSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];
    
    switch (step.id) {
      case 'service':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Choose Your Service</h2>
              <p className="text-muted-foreground">Select the notary service you need</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    bookingData.serviceId === service.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => updateBookingData({ serviceId: service.id, service })}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${service.price}</p>
                        {service.requiresDeposit && (
                          <p className="text-sm text-muted-foreground">
                            ${service.depositAmount} deposit
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {service.duration} min
                      </span>
                      <Badge variant="outline">{service.serviceType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'signers':
        return (
          <MultiSignerForm
            signers={bookingData.signers}
            onSignersChange={(signers) => updateBookingData({ signers })}
            maxSigners={10}
            showRoles={true}
            showNotificationPrefs={true}
          />
        );

      case 'documents':
        return (
          <DocumentUpload
            documents={bookingData.documents}
            onDocumentsChange={(documents) => updateBookingData({ documents })}
            maxFileSize={10}
            maxFiles={20}
            showPreview={true}
            requiredDocTypes={['CONTRACT', 'ID_DOCUMENT']}
          />
        );

      case 'scheduling':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Schedule Your Appointment</h2>
              <p className="text-muted-foreground">Choose date, time, and location</p>
            </div>
            
            {/* Date/Time Selection - Integrate with existing calendar component */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Calendar integration would go here - using existing AppointmentCalendar component
                </p>
                {/* Placeholder for calendar integration */}
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Service Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={bookingData.addressStreet}
                      onChange={(e) => updateBookingData({ addressStreet: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={bookingData.addressCity}
                      onChange={(e) => updateBookingData({ addressCity: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Houston"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={bookingData.addressState}
                      onChange={(e) => updateBookingData({ addressState: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={bookingData.addressZip}
                      onChange={(e) => updateBookingData({ addressZip: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="77001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'addons':
        return (
          <ServiceAddons
            serviceId={bookingData.serviceId}
            selectedAddons={bookingData.selectedAddons}
            onAddonsChange={(selectedAddons) => updateBookingData({ selectedAddons })}
            totalSigners={bookingData.signers.length}
            urgencyLevel={bookingData.urgencyLevel}
            showPricing={true}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Review Your Booking</h2>
              <p className="text-muted-foreground">Please review all details before submitting</p>
            </div>

            {/* Service Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-medium">${selectedService?.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signers Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Signers ({bookingData.signers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookingData.signers.map((signer, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{signer.name}</span>
                      <Badge variant="outline">{signer.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Total Price */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${calculateTotalPrice().toFixed(2)}
                </div>
                {selectedService?.requiresDeposit && (
                  <p className="text-sm text-green-700 mt-1">
                    ${selectedService.depositAmount} deposit required to confirm
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={bookingData.termsAccepted}
                onChange={(e) => updateBookingData({ termsAccepted: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="terms" className="text-sm">
                I accept the{' '}
                <a href="/terms" className="text-blue-600 underline" target="_blank">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 underline" target="_blank">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Book Your Notary Service</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isValid = validateStep(index);
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? isValid
                        ? 'border-blue-500 text-blue-500'
                        : 'border-red-500 text-red-500'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : 'Complete Booking'}
              <CreditCard className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Validation Alert */}
      {!canProceed() && (
        <Alert className="mt-4">
          <AlertDescription>
            Please complete all required fields to continue.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 