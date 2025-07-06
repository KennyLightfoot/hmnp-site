'use client';

/**
 * Championship Booking System - Location Step
 * Houston Mobile Notary Pros
 * 
 * Address collection with real-time travel fee calculation,
 * service area validation, and location intelligence.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Car,
  Building,
  Home,
  Coffee,
  Info,
  Zap,
  Calculator
} from 'lucide-react';

import { CreateBooking } from '@/lib/booking-validation';
import {
  LocationStepProps,
  LocationChangeHandler,
  PopularArea
} from '@/lib/types/booking-interfaces';

// Use imported LocationStepProps from booking-interfaces

interface AddressSuggestion {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
}

interface TravelCalculation {
  distance: number;
  duration: number;
  fee: number;
  withinServiceArea: boolean;
  serviceAreaName?: string;
}

const LOCATION_TYPES = [
  {
    id: 'CLIENT_ADDRESS',
    title: 'Your Location',
    description: 'Home, office, or any address you prefer',
    icon: Home,
    popular: true
  },
  {
    id: 'NEUTRAL_LOCATION',
    title: 'Neutral Location',
    description: 'Coffee shop, library, or public space',
    icon: Coffee,
    popular: false
  },
  {
    id: 'NOTARY_OFFICE',
    title: 'Our Office',
    description: 'Visit our professional office space',
    icon: Building,
    popular: false,
    note: 'No travel fees apply'
  }
];

const POPULAR_AREAS = [
  { name: 'Downtown Houston', zipCode: '77002', distance: 25 },
  { name: 'The Heights', zipCode: '77008', distance: 18 },
  { name: 'Katy', zipCode: '77494', distance: 22 },
  { name: 'Sugar Land', zipCode: '77478', distance: 15 },
  { name: 'Pearland', zipCode: '77584', distance: 8 },
  { name: 'Clear Lake', zipCode: '77058', distance: 12 }
];

export default function LocationStep({ data, onUpdate, errors, pricing }: LocationStepProps) {
  const { setValue, watch } = useFormContext<CreateBooking>();
  
  const [travelCalculation, setTravelCalculation] = useState<TravelCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const watchedLocation = watch('location') || {} as any;
  const watchedLocationType = watch('locationType') || 'CLIENT_ADDRESS';
  const watchedServiceType = watch('serviceType');

  const handleLocationTypeChange = (newType: string) => {
    setValue('locationType', newType as any);
    onUpdate({ locationType: newType });
    
    // Clear location data if switching to office or RON
    if (newType === 'NOTARY_OFFICE') {
      setValue('location', undefined);
      onUpdate({ location: undefined });
      setTravelCalculation(null);
    }
  };

  const handleLocationChange: LocationChangeHandler = (field, value) => {
    const updatedLocation = { ...watchedLocation, [field]: value };
    setValue(`location.${field}` as any, value);
    onUpdate({ location: updatedLocation });
  };

  // Real-time address validation and travel calculation
  const calculateTravel = useCallback(async () => {
    if (!watchedLocation || 
        !('address' in watchedLocation) || !watchedLocation.address || 
        !('city' in watchedLocation) || !watchedLocation.city || 
        !('state' in watchedLocation) || !watchedLocation.state || 
        !('zipCode' in watchedLocation) || !watchedLocation.zipCode) {
      setTravelCalculation(null);
      return;
    }

    if (watchedLocationType === 'NOTARY_OFFICE' || watchedServiceType === 'RON_SERVICES') {
      setTravelCalculation(null);
      return;
    }

    setCalculating(true);
    
    try {
      const fullAddress = `${watchedLocation.address}, ${watchedLocation.city}, ${watchedLocation.state} ${watchedLocation.zipCode}`;
      
      // Use real UnifiedDistanceService for accurate calculations
      const { UnifiedDistanceService } = await import('@/lib/maps/unified-distance-service');
      const result = await UnifiedDistanceService.calculateDistance(fullAddress, watchedServiceType || 'STANDARD_NOTARY');
      
      setTravelCalculation({
        distance: result.distance.miles,
        duration: result.duration.minutes,
        fee: result.travelFee,
        withinServiceArea: result.isWithinServiceArea,
        serviceAreaName: result.serviceArea.isWithinStandardArea ? 'Standard Service Area' : 
                        result.serviceArea.isWithinExtendedArea ? 'Extended Service Area' : 
                        'Outer Service Area'
      });
      
      // Update the form with calculated distance
      handleLocationChange('calculatedDistance', result.distance.miles);
      
    } catch (error) {
      console.error('Travel calculation failed:', error);
      // Fallback calculation if API fails
      const estimatedDistance = 15; // Safe fallback
      const estimatedFee = Math.max(0, (estimatedDistance - 15) * 0.50);
      
      setTravelCalculation({
        distance: estimatedDistance,
        duration: estimatedDistance * 2,
        fee: estimatedFee,
        withinServiceArea: estimatedDistance <= 50,
        serviceAreaName: 'Estimated Service Area'
      });
      
      handleLocationChange('calculatedDistance', estimatedDistance);
    } finally {
      setCalculating(false);
    }
  }, [watchedLocation, watchedLocationType, watchedServiceType]);

  // Trigger calculation when address changes
  useEffect(() => {
    const timer = setTimeout(calculateTravel, 1000);
    return () => clearTimeout(timer);
  }, [calculateTravel]);

  // Real Google Places API address autocomplete
  const handleAddressInput = async (address: string) => {
    handleLocationChange('address', address);
    
    if (address.length > 3) {
      try {
        // Use real Google Places API instead of mock
        const { UnifiedDistanceService } = await import('@/lib/maps/unified-distance-service');
        const predictions = await UnifiedDistanceService.getPlacePredictions(address);
        
        // Convert Google Places predictions to our suggestion format
        const suggestions: AddressSuggestion[] = predictions.map(prediction => {
          // Extract city, state, zip from secondary text
          const secondary = prediction.structuredFormatting.secondaryText;
          const parts = secondary.split(', ');
          const city = parts[0] || 'Houston';
          const stateZip = parts[1]?.split(' ') || ['TX', '77001'];
          const state = stateZip[0] || 'TX';
          const zipCode = stateZip[1] || '77001';
          
          return {
            address: prediction.structuredFormatting.mainText,
            city,
            state,
            zipCode,
            confidence: 0.9 // Google Places API is generally high confidence
          };
        });
        
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Address prediction failed:', error);
        // Fallback to simple suggestions if API fails
        const fallbackSuggestions: AddressSuggestion[] = [
          {
            address: `${address} (enter full address)`,
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            confidence: 0.5
          }
        ];
        setAddressSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    handleLocationChange('address', suggestion.address);
    handleLocationChange('city', suggestion.city);
    handleLocationChange('state', suggestion.state);
    handleLocationChange('zipCode', suggestion.zipCode);
    if (suggestion.latitude) handleLocationChange('latitude', suggestion.latitude);
    if (suggestion.longitude) handleLocationChange('longitude', suggestion.longitude);
    setShowSuggestions(false);
  };

  const selectPopularArea = (area: PopularArea) => {
    handleLocationChange('city', area.name.includes('Houston') ? 'Houston' : area.name);
    handleLocationChange('state', 'TX');
    handleLocationChange('zipCode', area.zipCode);
  };

  // Show RON option for applicable services
  if (watchedServiceType === 'RON_SERVICES') {
    return (
      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Zap className="h-5 w-5" />
              <span>Remote Online Notarization</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Connect from anywhere with secure video technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">No travel required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Available 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Secure video platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Digital document handling</span>
              </div>
            </div>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You'll receive a secure video link via email to join your RON session. 
                Have a valid government-issued ID ready for verification.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Where should we meet you?</span>
          </CardTitle>
          <CardDescription>
            Choose the most convenient location for your notary appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={watchedLocationType} 
            onValueChange={handleLocationTypeChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {LOCATION_TYPES.map((type) => (
              <div key={type.id} className="relative">
                <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                <Label
                  htmlFor={type.id}
                  className="cursor-pointer block"
                >
                  <Card className={`transition-all duration-200 ${
                    watchedLocationType === type.id 
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <type.icon className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{type.title}</h3>
                            {type.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {type.description}
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

      {/* Address Form (only show for client locations) */}
      {(watchedLocationType === 'CLIENT_ADDRESS' || watchedLocationType === 'NEUTRAL_LOCATION') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Address Input Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-green-600" />
                  <span>Service Address</span>
                </CardTitle>
                <CardDescription>
                  Enter the complete address where we should meet you
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Street Address with Autocomplete */}
                <div className="space-y-2 relative">
                  <Label htmlFor="location.address" className="text-sm font-medium flex items-center space-x-1">
                    <span>Street Address</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location.address"
                    placeholder="123 Main Street, Apt 4B"
                    value={watchedLocation.address || ''}
                    onChange={(e) => handleAddressInput(e.target.value)}
                    className={errors?.location?.address ? 'border-red-500' : ''}
                  />
                  
                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <Card className="absolute top-full left-0 right-0 z-10 mt-1 shadow-lg">
                      <CardContent className="p-0">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectSuggestion(suggestion)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                          >
                            <div className="font-medium">{suggestion.address}</div>
                            <div className="text-sm text-gray-600">
                              {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  
                  {errors?.location?.address && (
                    <p className="text-sm text-red-600">{errors.location.address.message}</p>
                  )}
                </div>

                {/* City, State, ZIP Row */}
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
                  
                  <div className="space-y-2">
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

                {/* Access Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="location.accessInstructions" className="text-sm font-medium">
                    Access Instructions (Optional)
                  </Label>
                  <Textarea
                    id="location.accessInstructions"
                    placeholder="Building entrance, parking details, gate codes, apartment instructions, etc."
                    value={watchedLocation.accessInstructions || ''}
                    onChange={(e) => handleLocationChange('accessInstructions', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-gray-600">
                    Help us find you easily with specific directions or access details
                  </p>
                </div>

                {/* Parking Notes */}
                <div className="space-y-2">
                  <Label htmlFor="location.parkingNotes" className="text-sm font-medium">
                    Parking Notes (Optional)
                  </Label>
                  <Input
                    id="location.parkingNotes"
                    placeholder="Street parking available, visitor parking in garage, etc."
                    value={watchedLocation.parkingNotes || ''}
                    onChange={(e) => handleLocationChange('parkingNotes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Travel Calculation & Popular Areas Sidebar */}
          <div className="space-y-4">
            {/* Travel Fee Calculation */}
            {travelCalculation && (
              <Card className={`${
                travelCalculation.withinServiceArea 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Travel Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Distance:</span>
                    <span className="font-medium">{travelCalculation.distance.toFixed(1)} miles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Travel time:</span>
                    <span className="font-medium">{Math.round(travelCalculation.duration)} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Travel fee:</span>
                    <span className={`font-bold ${
                      travelCalculation.fee === 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {travelCalculation.fee === 0 ? 'FREE' : `$${travelCalculation.fee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {travelCalculation.withinServiceArea ? (
                    <Alert className="border-green-200 bg-green-50 p-2">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Great news!</strong> This location is within our primary service area.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-orange-200 bg-orange-50 p-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        This location requires additional travel fees. Extended Hours service includes more travel radius.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
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
            <Alert className="border-blue-200 bg-blue-50">
              <Car className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium text-blue-900">Service Areas:</div>
                  <div className="text-sm text-blue-800">
                    • <strong>Standard:</strong> 15-mile radius included<br />
                    • <strong>Extended Hours:</strong> 20-mile radius included<br />
                    • <strong>Beyond:</strong> $0.50 per additional mile
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}