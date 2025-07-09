'use client';

/**
 * 🚀 MOBILE-OPTIMIZED LOCATION STEP
 * Houston Mobile Notary Pros
 * 
 * Enhanced location selection with mobile-first design,
 * real-time travel calculations, and improved UX
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  MapPin, 
  Home, 
  Building, 
  Car, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  Zap,
  Shield,
  Star,
  Smartphone,
  Monitor
} from 'lucide-react';

interface LocationStepProps {
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    locationType?: string;
    accessInstructions?: string;
    parkingNotes?: string;
  };
  serviceType?: string;
  onUpdate?: (updates: any) => void;
  errors?: any;
  pricing?: any;
}

interface AddressSuggestion {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

interface TravelCalculation {
  distance: number;
  travelFee: number;
  estimatedTime: string;
  serviceArea: boolean;
}

interface PopularArea {
  name: string;
  zipCode: string;
  distance: number;
}

// Location types with mobile-optimized descriptions
const LOCATION_TYPES = [
  {
    id: 'CLIENT_LOCATION',
    title: 'Your Location',
    shortTitle: 'Your Place',
    description: 'We come to you - home, office, or anywhere convenient',
    mobileDescription: 'We come to you',
    icon: Home,
    popular: true,
    note: 'Most popular choice'
  },
  {
    id: 'NOTARY_OFFICE',
    title: 'Our Office',
    shortTitle: 'Our Office',
    description: 'Visit our professional office in Houston',
    mobileDescription: 'Visit our office',
    icon: Building,
    popular: false,
    note: 'No travel fee'
  },
  {
    id: 'PUBLIC_LOCATION',
    title: 'Public Location',
    shortTitle: 'Public Place',
    description: 'Meet at a library, coffee shop, or other public place',
    mobileDescription: 'Public meeting place',
    icon: Car,
    popular: false,
    note: 'Flexible options'
  }
];

// Popular Houston areas for quick selection
const POPULAR_AREAS: PopularArea[] = [
  { name: 'Downtown Houston', zipCode: '77002', distance: 5 },
  { name: 'Galleria Area', zipCode: '77056', distance: 8 },
  { name: 'Medical Center', zipCode: '77030', distance: 6 },
  { name: 'Rice Village', zipCode: '77005', distance: 4 },
  { name: 'Heights', zipCode: '77008', distance: 7 },
  { name: 'Montrose', zipCode: '77006', distance: 3 },
  { name: 'West University', zipCode: '77005', distance: 5 },
  { name: 'River Oaks', zipCode: '77019', distance: 6 }
];

export default function LocationStep({ 
  location = {}, 
  serviceType = 'STANDARD_NOTARY',
  onUpdate, 
  errors, 
  pricing 
}: LocationStepProps) {
  const { setValue, watch, formState: { errors: formErrors } } = useFormContext();
  
  // Enhanced state management
  const [locationType, setLocationType] = useState(location.locationType || 'CLIENT_LOCATION');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [travelCalculation, setTravelCalculation] = useState<TravelCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Watch form values
  const watchedLocation = watch('location') || location;
  const watchedServiceType = watch('serviceType') || serviceType;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced location change handler
  const handleLocationChange = useCallback((field: string, value: string) => {
    setValue(`location.${field}`, value);
    setErrorMessage(null);
    
    // Trigger update callback
    onUpdate?.({
      location: {
        ...watchedLocation,
        [field]: value
      }
    });

    // Auto-calculate travel if we have enough data
    if (field === 'zipCode' && value && locationType === 'CLIENT_LOCATION') {
      setTimeout(() => calculateTravel(), 500);
    }
  }, [setValue, watchedLocation, onUpdate, locationType]);

  // Enhanced travel calculation with better error handling
  const calculateTravel = useCallback(async () => {
    if (!watchedLocation || 
        !watchedLocation.address || 
        !watchedLocation.city || 
        !watchedLocation.state || 
        !watchedLocation.zipCode) {
      setTravelCalculation(null);
      return;
    }

    // Skip calculation for services that don't require travel
    if (locationType === 'NOTARY_OFFICE' || watchedServiceType === 'RON_SERVICES') {
      setTravelCalculation(null);
      return;
    }

    setCalculating(true);
    setErrorMessage(null);
    
    try {
      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock travel calculation (replace with real API call)
      const distance = Math.floor(Math.random() * 25) + 5; // 5-30 miles
      const baseTravelFee = distance > 30 ? 25 : distance > 20 ? 20 : distance > 10 ? 15 : 0;
      const serviceRadius = watchedServiceType === 'QUICK_STAMP_LOCAL' ? 10 : 30;
      
      const calculation: TravelCalculation = {
        distance,
        travelFee: distance > serviceRadius ? baseTravelFee : 0,
        estimatedTime: `${Math.ceil(distance / 15)}-${Math.ceil(distance / 10)} min`,
        serviceArea: distance <= serviceRadius
      };
      
      setTravelCalculation(calculation);
      
    } catch (error) {
      console.error('Travel calculation failed:', error);
      setErrorMessage('Unable to calculate travel details. Please try again.');
    } finally {
      setCalculating(false);
    }
  }, [watchedLocation, locationType, watchedServiceType]);

  // Address suggestions handler
  const handleAddressInput = useCallback(async (value: string) => {
    handleLocationChange('address', value);
    
    if (value.length > 3) {
      try {
        // Simulate address suggestions API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const suggestions: AddressSuggestion[] = [
          {
            address: `${value}, Houston, TX`,
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            latitude: 29.7604,
            longitude: -95.3698
          },
          {
            address: `${value} Street, Houston, TX`,
            city: 'Houston',
            state: 'TX',
            zipCode: '77002',
            latitude: 29.7604,
            longitude: -95.3698
          }
        ];
        
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Address suggestions failed:', error);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [handleLocationChange]);

  // Select address suggestion
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    handleLocationChange('address', suggestion.address);
    handleLocationChange('city', suggestion.city);
    handleLocationChange('state', suggestion.state);
    handleLocationChange('zipCode', suggestion.zipCode);
    if (suggestion.latitude) handleLocationChange('latitude', suggestion.latitude);
    if (suggestion.longitude) handleLocationChange('longitude', suggestion.longitude);
    setShowSuggestions(false);
  };

  // Select popular area
  const selectPopularArea = (area: PopularArea) => {
    handleLocationChange('city', area.name.includes('Houston') ? 'Houston' : area.name);
    handleLocationChange('state', 'TX');
    handleLocationChange('zipCode', area.zipCode);
  };

  // Check if location step is complete
  const isLocationComplete = useMemo(() => {
    if (watchedServiceType === 'RON_SERVICES') return true;
    if (locationType === 'NOTARY_OFFICE') return true;
    
    return watchedLocation.address && 
           watchedLocation.city && 
           watchedLocation.state && 
           watchedLocation.zipCode;
  }, [watchedLocation, locationType, watchedServiceType]);

  // Show RON option for applicable services
  if (watchedServiceType === 'RON_SERVICES') {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {isMobile ? 'Remote Service' : 'Remote Online Notarization'}
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            No location needed - we'll meet you online!
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Monitor className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Remote Service Selected
            </h3>
            <p className="text-green-800 mb-4">
              Your RON appointment will be conducted online via our secure platform. 
              No travel required!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Secure Platform
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Available 24/7
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                No Travel Fee
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 🚀 MOBILE-OPTIMIZED HEADER */}
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {isMobile ? 'Where to Meet?' : 'Where Should We Meet You?'}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {isMobile 
            ? 'Choose your preferred location'
            : 'Select where you\'d like us to meet for your notary service'
          }
        </p>
      </div>

      {/* 🚀 LOCATION TYPE SELECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            {isMobile ? 'Location Type' : 'Choose Meeting Location'}
          </CardTitle>
          <CardDescription className="text-sm">
            Select how you'd like to meet for your notary service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={locationType} 
            onValueChange={(value) => {
              setLocationType(value);
              setValue('location.locationType', value);
              setTravelCalculation(null);
              onUpdate?.({ location: { ...watchedLocation, locationType: value } });
            }}
            className="space-y-3"
          >
            {LOCATION_TYPES.map((type) => (
              <div key={type.id} className="relative">
                <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                <Label
                  htmlFor={type.id}
                  className="cursor-pointer block"
                >
                  <Card className={`transition-all duration-200 ${
                    locationType === type.id 
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <type.icon className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{isMobile ? type.shortTitle : type.title}</h3>
                            {type.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {isMobile ? type.mobileDescription : type.description}
                          </p>
                          {type.note && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              {type.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* 🚀 ADDRESS FORM (only show for client locations) */}
      {locationType === 'CLIENT_LOCATION' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Home className="h-5 w-5 mr-2 text-blue-600" />
              {isMobile ? 'Your Address' : 'Your Address Details'}
            </CardTitle>
            <CardDescription className="text-sm">
              Enter your address so we can calculate travel time and fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Street Address */}
            <div className="space-y-2">
              <Label htmlFor="location.address" className="text-sm font-medium">Street Address *</Label>
              <div className="relative">
                <Input
                  id="location.address"
                  placeholder={isMobile ? "123 Main St" : "Enter your street address"}
                  value={watchedLocation.address || ''}
                  onChange={(e) => handleAddressInput(e.target.value)}
                  className={`h-12 md:h-10 ${
                    errors?.location?.address || formErrors?.location?.address ? 'border-red-500' : ''
                  }`}
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium">{suggestion.address}</div>
                        <div className="text-xs text-gray-500">{suggestion.city}, {suggestion.state} {suggestion.zipCode}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* City, State, ZIP Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location.city" className="text-sm font-medium">City *</Label>
                <Input
                  id="location.city"
                  placeholder="Houston"
                  value={watchedLocation.city || ''}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className={errors?.location?.city ? 'border-red-500' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location.state" className="text-sm font-medium">State *</Label>
                <Input
                  id="location.state"
                  placeholder="TX"
                  value={watchedLocation.state || ''}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  className={errors?.location?.state ? 'border-red-500' : ''}
                />
              </div>
              
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="location.zipCode" className="text-sm font-medium">ZIP Code *</Label>
                <Input
                  id="location.zipCode"
                  placeholder="77001"
                  value={watchedLocation.zipCode || ''}
                  onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                  className={errors?.location?.zipCode ? 'border-red-500' : ''}
                />
              </div>
            </div>

            {/* Service Status Indicators */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Navigation className="h-3 w-3 mr-1" />
                We Travel to You
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Professional Service
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                On-Time Guarantee
              </Badge>
            </div>

            {/* Access Instructions */}
            <div className="space-y-2">
              <Label htmlFor="location.accessInstructions" className="text-sm font-medium">
                Access Instructions <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="location.accessInstructions"
                placeholder={isMobile ? "Building entrance, gate codes, etc." : "Building entrance, parking details, gate codes, apartment instructions, etc."}
                value={watchedLocation.accessInstructions || ''}
                onChange={(e) => handleLocationChange('accessInstructions', e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-600">
                Help us find you easily with specific directions or access details
              </p>
            </div>

            {/* Parking Notes */}
            <div className="space-y-2">
              <Label htmlFor="location.parkingNotes" className="text-sm font-medium">
                Parking Notes <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Input
                id="location.parkingNotes"
                placeholder={isMobile ? "Street parking, visitor spots" : "Street parking available, visitor parking in garage, etc."}
                value={watchedLocation.parkingNotes || ''}
                onChange={(e) => handleLocationChange('parkingNotes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🚀 TRAVEL CALCULATION & POPULAR AREAS SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          
          {/* Travel Calculation */}
          {locationType === 'CLIENT_LOCATION' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                  Travel Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!travelCalculation && !calculating && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">
                      Enter your address above to see travel details and fees
                    </p>
                    <Button 
                      onClick={calculateTravel}
                      disabled={!isLocationComplete}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Calculate Travel
                    </Button>
                  </div>
                )}

                {calculating && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
                      <div className="text-sm text-blue-700">
                        Calculating travel details...
                      </div>
                    </CardContent>
                  </Card>
                )}

                {travelCalculation && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">{travelCalculation.distance} mi</div>
                        <div className="text-xs text-gray-600">Distance</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {travelCalculation.travelFee > 0 ? `$${travelCalculation.travelFee}` : 'Free'}
                        </div>
                        <div className="text-xs text-gray-600">Travel Fee</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-orange-600">{travelCalculation.estimatedTime}</div>
                        <div className="text-xs text-gray-600">Travel Time</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-lg font-semibold ${travelCalculation.serviceArea ? 'text-green-600' : 'text-red-600'}`}>
                          {travelCalculation.serviceArea ? 'In Area' : 'Out of Area'}
                        </div>
                        <div className="text-xs text-gray-600">Service Area</div>
                      </div>
                    </div>
                    
                    {!travelCalculation.serviceArea && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          Your location is outside our standard service area. Additional travel fees may apply.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {/* Popular Areas Quick Select */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Popular Areas</CardTitle>
              <CardDescription className="text-sm">
                Quick select for common Houston locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {POPULAR_AREAS.map((area, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectPopularArea(area)}
                    className="w-full text-left p-2 rounded border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{area.name}</span>
                      <span className="text-xs text-gray-500">{area.distance}mi</span>
                    </div>
                    <div className="text-xs text-gray-600">{area.zipCode}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Area Info */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">Service Area</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Standard services: 30-mile radius</p>
                <p>• Quick-Stamp Local: 10-mile radius</p>
                <p>• RON services: No travel required</p>
                <p>• Extended hours available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🚀 COMPLETION STATUS */}
      <Card className={`border-2 transition-all duration-300 ${
        isLocationComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isLocationComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm font-medium ${
                isLocationComplete ? 'text-green-800' : 'text-gray-600'
              }`}>
                Location Details
              </span>
            </div>
            <Badge variant={isLocationComplete ? 'default' : 'secondary'} className="text-xs">
              {isLocationComplete ? 'Complete' : 'Required'}
            </Badge>
          </div>
          {isLocationComplete && (
            <p className="text-xs text-green-700 mt-2">
              ✅ {locationType === 'CLIENT_LOCATION' ? 'We\'ll travel to your location' : 'Meeting location confirmed'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 🚀 ERROR HANDLING */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}