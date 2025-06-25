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

// NEW IMPORTS: Add the missing integrations for Phase 2-A
import AppointmentCalendar from '@/components/appointment-calendar';
import RealTimePricing from './RealTimePricing';
import { DistanceService } from '@/lib/maps/distance';

// NEW IMPORTS: Phase 2-C Payment Mode Selection
import PaymentModeSelector from './PaymentModeSelector';

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
  
  // NEW Phase 2-B: RON Support
  isRONService?: boolean;
  ronIdentityVerification?: {
    kbaRequired?: boolean;
    idDocumentTypes?: string[];
    hasGovernmentId?: boolean;
    governmentIdType?: string;
    isFirstTimeRON?: boolean;
    specialIdRequirements?: string;
  };
  
  // Scheduling
  scheduledDateTime: string;
  locationType: 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE' | 'REMOTE_ONLINE_NOTARIZATION';
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
  
  // NEW: Distance and pricing fields for Phase 2-A
  distanceMiles?: number;
  travelFee?: number;
  estimatedTravelTime?: number;
  
  // NEW: Phase 2-C Payment fields
  paymentMode: 'full' | 'deposit';
  
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
    id: 'ron-verification',
    title: 'Identity Verification',
    description: 'RON identity requirements',
    icon: Users,
    required: true,
    showIf: (data: EnhancedBookingData) => data.isRONService === true
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
  
  // NEW: Phase 2-A state for distance calculations
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<EnhancedBookingData>({
    serviceId: '',
    isRONService: false,
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
    paymentMode: 'deposit', // Default to deposit mode
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
    
    // NEW: Phase 2-A - Auto-calculate distance when address changes
    if (updates.addressStreet || updates.addressCity || updates.addressState || updates.addressZip) {
      const newData = { ...bookingData, ...updates };
      if (newData.addressStreet && newData.addressCity && newData.addressState && newData.addressZip) {
        calculateDistance(newData);
      }
    }
  };

  // NEW: Phase 2-A - Distance calculation function
  const calculateDistance = async (data: EnhancedBookingData) => {
    const fullAddress = `${data.addressStreet}, ${data.addressCity}, ${data.addressState} ${data.addressZip}`;
    
    setIsCalculatingDistance(true);
    setDistanceError(null);
    
    try {
      const result = await DistanceService.calculateDistance(fullAddress);
      
      if (result.isWithinServiceArea) {
        const travelFee = DistanceService.calculateTravelFee(result.distance.miles);
        
        updateBookingData({
          distanceMiles: result.distance.miles,
          travelFee: travelFee,
          estimatedTravelTime: result.duration.minutes
        });
        
        if (result.warnings.length > 0) {
          toast({
            title: "Distance Notice",
            description: result.warnings.join('. '),
            variant: "default",
          });
        }
      } else {
        setDistanceError(`Location is outside our service area (${result.distance.miles} miles). Please contact us for special arrangements.`);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      setDistanceError('Unable to calculate distance. Travel fees will be determined during booking confirmation.');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const selectedService = services.find(s => s.id === bookingData.serviceId);

  const validateStep = (stepIndex: number): boolean => {
    const step = WIZARD_STEPS[stepIndex];
    
    switch (step.id) {
      case 'service':
        return !!bookingData.serviceId;
        
      case 'ron-verification':
        if (!bookingData.isRONService) return true; // Skip if not RON
        return !!(bookingData.ronIdentityVerification?.hasGovernmentId !== undefined &&
                 bookingData.ronIdentityVerification?.isFirstTimeRON !== undefined &&
                 (bookingData.ronIdentityVerification?.hasGovernmentId === false || 
                  bookingData.ronIdentityVerification?.governmentIdType));
        
      case 'signers':
        return bookingData.signers.length > 0 && 
               bookingData.signers.every(s => s.name && s.email) &&
               bookingData.signers.filter(s => s.role === 'PRIMARY').length === 1;
               
      case 'documents':
        // Optional step - always valid
        return true;
        
      case 'scheduling':
        const hasDateTime = !!bookingData.scheduledDateTime;
        if (bookingData.isRONService) {
          // RON only needs date/time, no address
          return hasDateTime;
        } else {
          // Mobile service needs address
          return hasDateTime && !!bookingData.addressStreet && !!bookingData.addressCity;
        }
               
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
    const travelFee = bookingData.travelFee || 0;
    return servicePrice + addonsPrice + travelFee;
  };

  // NEW: Phase 2-A - Real-time pricing inputs for the pricing component
  const getPricingInputs = () => {
    // Convert our Service to ServiceData format expected by RealTimePricing
    const serviceData = selectedService ? {
      id: selectedService.id,
      name: selectedService.name,
      price: selectedService.price,
      requiresDeposit: selectedService.requiresDeposit,
      depositAmount: selectedService.depositAmount,
      duration: selectedService.duration
    } : undefined;
    
    return {
      service: serviceData,
      numberOfSigners: bookingData.signers.length,
      distance: bookingData.distanceMiles || 0,
      extraDocuments: bookingData.documents.length,
      isWeekend: false, // TODO: Calculate based on scheduledDateTime
      isHoliday: false, // TODO: Calculate based on scheduledDateTime
      isAfterHours: false, // TODO: Calculate based on scheduledDateTime
      needsOvernightHandling: bookingData.urgencyLevel === 'emergency',
      needsBilingualService: false, // TODO: Add bilingual option to form
      promoCode: bookingData.promoCode,
      urgencyLevel: bookingData.urgencyLevel
    };
  };

  // NEW: Phase 2-B - Check if service is RON compatible
  const isServiceRONCapable = (service: Service) => {
    return service.serviceType === 'REMOTE_ONLINE_NOTARIZATION' || 
           service.name.toLowerCase().includes('remote') ||
           service.name.toLowerCase().includes('ron');
  };

  // NEW: Phase 2-B - Handle RON service toggle
  const handleRONToggle = (isRON: boolean) => {
    updateBookingData({ 
      isRONService: isRON,
      locationType: isRON ? 'REMOTE_ONLINE_NOTARIZATION' : 'CLIENT_SPECIFIED_ADDRESS',
      // Reset location fields if switching to RON
      ...(isRON ? {
        addressStreet: '',
        addressCity: '',
        addressState: 'TX',
        addressZip: '',
        distanceMiles: undefined,
        travelFee: undefined,
        estimatedTravelTime: undefined
      } : {})
    });
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
      // Enhanced booking data with payment mode
      const enhancedBookingData = {
        ...bookingData,
        paymentMode: bookingData.paymentMode, // Pass payment mode to backend
        totalAmount: calculateTotalPrice(),
        depositAmount: selectedService?.depositAmount || 0
      };
      
      await onBookingSubmit(enhancedBookingData);
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

            {/* NEW: Phase 2-B - RON Toggle */}
            {selectedService && isServiceRONCapable(selectedService) && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    🌐 Remote Online Notarization (RON) Available
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    This service can be completed online from anywhere! No travel required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                        !bookingData.isRONService 
                          ? 'border-blue-500 bg-blue-100' 
                          : 'border-gray-300 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleRONToggle(false)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          !bookingData.isRONService ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`} />
                        <h3 className="font-semibold">Mobile Service</h3>
                      </div>
                      <p className="text-sm text-gray-600">Notary comes to your location</p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• In-person service</li>
                        <li>• Travel fees may apply</li>
                        <li>• Flexible scheduling</li>
                      </ul>
                    </div>
                    
                    <div 
                      className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                        bookingData.isRONService 
                          ? 'border-green-500 bg-green-100' 
                          : 'border-gray-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleRONToggle(true)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          bookingData.isRONService ? 'bg-green-500 border-green-500' : 'border-gray-400'
                        }`} />
                        <h3 className="font-semibold">Remote Online (RON)</h3>
                      </div>
                      <p className="text-sm text-gray-600">Complete entirely online</p>
                      <ul className="text-xs text-gray-500 mt-2 space-y-1">
                        <li>• No travel required</li>
                        <li>• Same legal validity</li>
                        <li>• Texas compliant</li>
                        <li>• Available 24/7</li>
                      </ul>
                    </div>
                  </div>

                  {bookingData.isRONService && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        <strong>RON Selected:</strong> You'll complete this notarization via secure video call. 
                        Identity verification and document upload will be required before your appointment.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
            
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
                    {/* NEW: RON compatibility indicator */}
                    {isServiceRONCapable(service) && (
                      <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50">
                        RON Available
                      </Badge>
                    )}
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

      case 'ron-verification':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Identity Verification for RON</h2>
              <p className="text-muted-foreground">
                Remote Online Notarization requires identity verification to comply with Texas law
              </p>
            </div>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">Required for RON Session</CardTitle>
                <CardDescription className="text-amber-700">
                  Texas Government Code requires the following identity verification steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Do you have a current government-issued photo ID? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="hasGovernmentId"
                        checked={bookingData.ronIdentityVerification?.hasGovernmentId === true}
                        onChange={() => updateBookingData({
                          ronIdentityVerification: {
                            ...bookingData.ronIdentityVerification,
                            hasGovernmentId: true,
                            kbaRequired: false,
                            idDocumentTypes: ['DRIVERS_LICENSE', 'PASSPORT', 'STATE_ID'],
                            isFirstTimeRON: false
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Yes, I have a valid government-issued photo ID</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="hasGovernmentId"
                        checked={bookingData.ronIdentityVerification?.hasGovernmentId === false}
                        onChange={() => updateBookingData({
                          ronIdentityVerification: {
                            ...bookingData.ronIdentityVerification,
                            hasGovernmentId: false,
                            kbaRequired: true,
                            idDocumentTypes: [],
                            isFirstTimeRON: true
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span>No, I need Knowledge-Based Authentication (KBA)</span>
                    </label>
                  </div>
                </div>

                {bookingData.ronIdentityVerification?.hasGovernmentId && (
                  <div className="space-y-3 p-4 border border-green-200 bg-green-50 rounded">
                    <label className="block text-sm font-medium text-green-800">
                      Type of ID you'll present *
                    </label>
                    <select
                      value={bookingData.ronIdentityVerification?.governmentIdType || ''}
                      onChange={(e) => updateBookingData({
                        ronIdentityVerification: {
                          ...bookingData.ronIdentityVerification,
                          governmentIdType: e.target.value,
                          hasGovernmentId: true,
                          kbaRequired: false,
                          idDocumentTypes: [e.target.value],
                          isFirstTimeRON: false
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select ID type...</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                      <option value="STATE_ID">State ID Card</option>
                      <option value="PASSPORT">US Passport</option>
                      <option value="MILITARY_ID">Military ID</option>
                    </select>
                    <p className="text-sm text-green-700">
                      ✓ You'll show this ID to the notary during your video session
                    </p>
                  </div>
                )}

                {bookingData.ronIdentityVerification?.kbaRequired && (
                  <div className="space-y-3 p-4 border border-blue-200 bg-blue-50 rounded">
                    <h4 className="font-medium text-blue-800">Knowledge-Based Authentication (KBA)</h4>
                    <p className="text-sm text-blue-700">
                      Since you don't have a government ID, you'll answer questions about your personal 
                      history that only you would know (credit history, previous addresses, etc.).
                    </p>
                    <Alert>
                      <AlertDescription>
                        KBA verification typically takes 5-10 minutes and happens before your notary session.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Is this your first time using Remote Online Notarization?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isFirstTimeRON"
                        checked={bookingData.ronIdentityVerification?.isFirstTimeRON === true}
                        onChange={() => updateBookingData({
                          ronIdentityVerification: {
                            ...bookingData.ronIdentityVerification,
                            isFirstTimeRON: true
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span>Yes, this is my first RON session</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="isFirstTimeRON"
                        checked={bookingData.ronIdentityVerification?.isFirstTimeRON === false}
                        onChange={() => updateBookingData({
                          ronIdentityVerification: {
                            ...bookingData.ronIdentityVerification,
                            isFirstTimeRON: false
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span>No, I've used RON before</span>
                    </label>
                  </div>
                </div>

                {bookingData.ronIdentityVerification?.isFirstTimeRON && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      <strong>First-time RON user:</strong> We'll send you a brief tutorial video 
                      and technical requirements before your appointment.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    value={bookingData.ronIdentityVerification?.specialIdRequirements || ''}
                    onChange={(e) => updateBookingData({
                      ronIdentityVerification: {
                        ...bookingData.ronIdentityVerification,
                        specialIdRequirements: e.target.value
                      }
                    })}
                    placeholder="Any accessibility needs, preferred language, or special circumstances..."
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
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
            
            {/* Location Details - Now with distance calculation */}
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
                
                {/* NEW: Distance calculation status */}
                {isCalculatingDistance && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Calculating distance...</span>
                  </div>
                )}
                
                {distanceError && (
                  <Alert>
                    <AlertDescription className="text-amber-600">
                      {distanceError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {bookingData.distanceMiles && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center text-sm">
                      <span>Distance from Houston:</span>
                      <span className="font-medium">{bookingData.distanceMiles} miles</span>
                    </div>
                    {bookingData.travelFee && bookingData.travelFee > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Travel fee:</span>
                        <span className="font-medium text-green-600">${bookingData.travelFee.toFixed(2)}</span>
                      </div>
                    )}
                    {bookingData.estimatedTravelTime && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Estimated travel time:</span>
                        <span className="font-medium">{bookingData.estimatedTravelTime} minutes</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location Notes (Optional)</label>
                  <textarea
                    value={bookingData.locationNotes || ''}
                    onChange={(e) => updateBookingData({ locationNotes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Gate code, parking instructions, apartment number, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date/Time Selection - NOW WITH REAL CALENDAR */}
            {selectedService && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AppointmentCalendar
                    serviceType={selectedService.serviceType as any}
                    numberOfSigners={bookingData.signers.length}
                    onTimeSelected={(startTime, endTime, formattedTime, calendarId) => {
                      updateBookingData({ 
                        scheduledDateTime: startTime 
                      });
                    }}
                  />
                </CardContent>
              </Card>
            )}
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

            {/* NEW: Phase 2-C Payment Mode Selection */}
            <PaymentModeSelector
              totalAmount={calculateTotalPrice()}
              depositAmount={selectedService?.depositAmount || 0}
              requiresDeposit={selectedService?.requiresDeposit || false}
              selectedMode={bookingData.paymentMode}
              onModeChange={(mode) => updateBookingData({ paymentMode: mode })}
              isRONService={bookingData.isRONService}
              className="border-green-200"
            />

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
    <div className="max-w-7xl mx-auto p-6">
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

      {/* Main Content - NEW: Two-column layout for Phase 2-A */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Step Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* NEW: Real-time Pricing Panel - Shows after service selection */}
        {currentStep > 0 && selectedService && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <RealTimePricing
                inputs={getPricingInputs()}
                onPricingCalculated={(pricing) => {
                  // Update booking data with calculated pricing if needed
                  if (pricing.travelFee !== bookingData.travelFee) {
                    setBookingData(prev => ({
                      ...prev,
                      travelFee: pricing.travelFee
                    }));
                  }
                }}
                showBreakdown={true}
                className="border-2 border-green-200"
              />
              
              {/* Quick Summary Card */}
              <Card className="mt-4 bg-slate-50">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signers:</span>
                      <span className="font-medium">{bookingData.signers.length}</span>
                    </div>
                    {bookingData.distanceMiles && (
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="font-medium">{bookingData.distanceMiles} miles</span>
                      </div>
                    )}
                    {bookingData.selectedAddons.length > 0 && (
                      <div className="flex justify-between">
                        <span>Add-ons:</span>
                        <span className="font-medium">{bookingData.selectedAddons.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

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