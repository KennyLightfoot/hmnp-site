"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string;
  type: string;
  typeLabel: string;
  duration: number;
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
}

interface BookingFormData {
  serviceId: string;
  scheduledDateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationType: 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE';
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationNotes: string;
  notes: string;
  promoCode: string;
}



export default function BookingPage() {
  const searchParams = useSearchParams();
  
  // State management
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [promoCodeValidation, setPromoCodeValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<BookingFormData>({
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
    locationNotes: '',
    notes: '',
    promoCode: '',
  });

  // Load services on component mount
  useEffect(() => {
    fetchServices();
    
    // Pre-select service if provided in URL params
    const serviceParam = searchParams?.get('service');
    if (serviceParam) {
      setFormData(prev => ({ ...prev, serviceId: serviceParam }));
    }
  }, [searchParams]);

  // Load selected service details
  useEffect(() => {
    if (formData.serviceId && services.length > 0) {
      const service = services.find(s => s.id === formData.serviceId);
      setSelectedService(service || null);
    }
  }, [formData.serviceId, services]);

  // Load availability when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability(selectedDate, selectedService.id);
    }
  }, [selectedService, selectedDate]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services.all);
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      setError('Failed to load services');
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async (date: string, serviceId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/availability?date=${date}&serviceId=${serviceId}`);
      const data = await response.json();
      
      if (data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      } else {
        setError('Failed to load availability');
      }
    } catch (error) {
      setError('Failed to load availability');
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePromoCode = async (code: string) => {
    if (!code || !selectedService) return;
    
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          serviceId: selectedService.id,
          basePrice: selectedService.basePrice,
        }),
      });
      
      const data = await response.json();
      setPromoCodeValidation(data);
    } catch (error) {
      console.error('Error validating promo code:', error);
    }
  };

  const handlePromoCodeChange = (code: string) => {
    setFormData(prev => ({ ...prev, promoCode: code }));
    setPromoCodeValidation(null);
    
    if (code.length >= 3) {
      validatePromoCode(code);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedTimeSlot) {
      setError('Please select a service and time slot');
      return;
    }

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTimeSlot.startTime}`).toISOString();
    
    const bookingData = {
      ...formData,
      serviceId: selectedService.id,
      scheduledDateTime,
    };

    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.booking && data.booking.id) {
        if (data.checkoutUrl) {
          // Redirect to Stripe for payment
          console.log("Redirecting to Stripe checkout:", data.checkoutUrl);
          window.location.href = data.checkoutUrl;
        } else {
          // Booking confirmed without payment
          console.log("Booking confirmed, redirecting to confirmation");
          window.location.href = `/booking/confirmation/${data.booking.id}`;
        }
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      setError('Failed to create booking');
      console.error('Error creating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return maxDate.toISOString().split('T')[0];
  };

  const calculatePrice = () => {
    if (!selectedService) return { basePrice: 0, discount: 0, finalPrice: 0 };
    
    const basePrice = selectedService.basePrice;
    const discount = promoCodeValidation?.valid ? promoCodeValidation.pricing.discountAmount : 0;
    const finalPrice = basePrice - discount;
    
    return { basePrice, discount, finalPrice };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Book Your Notary Service
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${
                step <= currentStep ? 'bg-[#A52A2A]' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-8">
          {/* Step 1: Service Selection */}
          {currentStep >= 1 && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Step 1: Select Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.serviceId === service.id
                        ? 'border-[#A52A2A] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, serviceId: service.id }));
                      setCurrentStep(Math.max(currentStep, 2));
                    }}
                  >
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{service.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-500">{service.duration} minutes</span>
                      <span className="font-bold text-[#A52A2A]">${service.basePrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep >= 2 && selectedService && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Step 2: Select Date & Time</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTimeSlot(null);
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={!slot.available}
                        className={`p-3 rounded border text-sm font-medium ${
                          selectedTimeSlot?.startTime === slot.startTime
                            ? 'bg-[#A52A2A] text-white border-[#A52A2A]'
                            : slot.available
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-[#A52A2A]'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          setSelectedTimeSlot(slot);
                          setCurrentStep(Math.max(currentStep, 3));
                        }}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep >= 3 && selectedTimeSlot && (
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Step 3: Your Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Location *
                  </label>
                  <select
                    value={formData.locationType}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      locationType: e.target.value as 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE'
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="CLIENT_SPECIFIED_ADDRESS">Your Location</option>
                    <option value="PUBLIC_PLACE">Public Place</option>
                  </select>
                </div>
              </div>

              {formData.locationType === 'CLIENT_SPECIFIED_ADDRESS' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.addressStreet}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressStreet: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.addressCity}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressCity: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.addressZip}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressZip: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#A52A2A] text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Promo Code */}
          {currentStep >= 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 4: Review & Book</h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => handlePromoCodeChange(e.target.value.toUpperCase())}
                  className="border border-gray-300 rounded-md px-3 py-2 w-64"
                  placeholder="Enter promo code"
                />
                {promoCodeValidation && (
                  <div className={`mt-2 text-sm ${
                    promoCodeValidation.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {promoCodeValidation.valid 
                      ? `${promoCodeValidation.promoCode.description} - Save $${promoCodeValidation.pricing.discountAmount}`
                      : promoCodeValidation.error
                    }
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate} at {selectedTimeSlot?.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">
                      {formData.locationType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${calculatePrice().basePrice}</span>
                  </div>
                  {calculatePrice().discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${calculatePrice().discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculatePrice().finalPrice}</span>
                  </div>
                  {selectedService?.requiresDeposit && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Deposit Required:</span>
                      <span>${selectedService.depositAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#A52A2A] text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating Booking...' : 'Book Now'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
