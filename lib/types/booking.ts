export interface BookingFormData {
  serviceId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  appointmentDateTime: string;
  serviceAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  numberOfSigners: number;
  documentType?: string;
  specialInstructions?: string;
  promoCode?: string;
  referralSource?: string;
}

export interface BookingStep { id: string; title: string; description: string; isComplete: boolean; isActive: boolean; }
export interface Service { id: string; name: string; description: string; basePrice: number; duration: number; category: string; isActive: boolean; }
export interface TimeSlot { startTime: string; endTime: string; duration: number; demand?: 'low' | 'moderate' | 'high'; available?: boolean; }

export interface BookingContextType {
  currentStep: number;
  formData: Partial<BookingFormData>;
  steps: BookingStep[];
  services: Service[];
  availableSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  updateFormData: (data: Partial<BookingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitBooking: () => Promise<void>;
}