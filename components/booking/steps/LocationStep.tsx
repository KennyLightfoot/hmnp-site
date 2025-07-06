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
  const [addressServiceStatus, setAddressServiceStatus] = useState<'normal' | 'degraded' | 'offline'>('normal');
  const [travelServiceStatus, setTravelServiceStatus] = useState<'normal' | 'degraded' | 'offline'>('normal');
  
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

  // Enhanced real-time address validation and travel calculation with comprehensive error handling
  const calculateTravel = useCallback(async () => {
    // Validate required location data
    if (!watchedLocation || 
        !('address' in watchedLocation) || !watchedLocation.address || 
        !('city' in watchedLocation) || !watchedLocation.city || 
        !('state' in watchedLocation) || !watchedLocation.state || 
        !('zipCode' in watchedLocation) || !watchedLocation.zipCode) {
      setTravelCalculation(null);
      return;
    }

    // Skip calculation for services that don't require travel
    if (watchedLocationType === 'NOTARY_OFFICE' || watchedServiceType === 'RON_SERVICES') {
      setTravelCalculation(null);
      return;
    }

    setCalculating(true);
    
    try {
      const fullAddress = `${watchedLocation.address}, ${watchedLocation.city}, ${watchedLocation.state} ${watchedLocation.zipCode}`;
      
      // Validate address format before sending to service
      if (fullAddress.length < 10) {
        throw new Error('Address too short for reliable calculation');
      }
      
      // Use real UnifiedDistanceService for accurate calculations
      const { UnifiedDistanceService } = await import('@/lib/maps/unified-distance-service');
      const result = await UnifiedDistanceService.calculateDistance(fullAddress, watchedServiceType || 'STANDARD_NOTARY');
      
      // Validate service response
      if (!result || !result.success) {
        throw new Error('Invalid response from distance service');
      }

      if (!result.distance || typeof result.distance.miles !== 'number') {
        throw new Error('Invalid distance data in service response');
      }

      // Log successful calculation for monitoring
      console.log('Travel calculation successful', {
        address: fullAddress.substring(0, 30) + '...',
        distance: result.distance.miles,
        fee: result.travelFee,
        serviceType: watchedServiceType,
        timestamp: new Date().toISOString()
      });

      // Update service status
      setTravelServiceStatus('normal');
      
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
      
      // Enhanced error tracking
      const errorDetails = {
        address: `${watchedLocation.address}, ${watchedLocation.city}, ${watchedLocation.state} ${watchedLocation.zipCode}`,
        serviceType: watchedServiceType,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        timestamp: new Date().toISOString(),
        stackTrace: error instanceof Error ? error.stack : undefined
      };
      
      console.error('CRITICAL: Travel calculation system failure', errorDetails);

      // Update service status to indicate degraded service
      setTravelServiceStatus('degraded');
      
      // Intelligent fallback calculation based on address data
      let estimatedDistance = 15; // Default safe fallback
      let estimatedFee = 0;
      let serviceAreaName = 'Estimated Service Area';
      
      try {
        // Enhanced fallback logic based on known Houston area data
        const city = watchedLocation.city?.toLowerCase() || '';
        const zipCode = watchedLocation.zipCode || '';
        
        // Distance estimates for common Houston areas from Texas City (77591)
        if (city.includes('league city') || zipCode.startsWith('77573')) {
          estimatedDistance = 5;
        } else if (city.includes('webster') || zipCode.startsWith('77598')) {
          estimatedDistance = 8;
        } else if (city.includes('clear lake') || zipCode.startsWith('77058')) {
          estimatedDistance = 10;
        } else if (city.includes('pasadena') || zipCode.startsWith('77506')) {
          estimatedDistance = 12;
        } else if (city.includes('houston') || zipCode.startsWith('770')) {
          estimatedDistance = 18;
        } else if (city.includes('sugar land') || zipCode.startsWith('77478')) {
          estimatedDistance = 18;
        } else if (city.includes('katy') || zipCode.startsWith('77449')) {
          estimatedDistance = 20;
        } else if (city.includes('cypress') || zipCode.startsWith('77429')) {
          estimatedDistance = 22;
        } else if (city.includes('tomball') || zipCode.startsWith('77375')) {
          estimatedDistance = 25;
        } else if (city.includes('conroe') || zipCode.startsWith('77301')) {
          estimatedDistance = 30;
        }
        
        // Calculate estimated fee based on service type
        const serviceRadius = watchedServiceType === 'EXTENDED_HOURS' ? 20 : 15;
        estimatedFee = Math.max(0, (estimatedDistance - serviceRadius) * 0.50);
        
        serviceAreaName = estimatedDistance <= 15 ? 'Standard Service Area (Estimated)' :
                        estimatedDistance <= 20 ? 'Extended Service Area (Estimated)' :
                        'Outer Service Area (Estimated)';
        
        console.log('Applied intelligent fallback calculation', {
          city,
          zipCode,
          estimatedDistance,
          estimatedFee,
          serviceAreaName
        });
        
      } catch (fallbackError) {
        console.error('Fallback calculation also failed, using safe defaults', fallbackError);
        // Use absolute safe defaults
        estimatedDistance = 20;
        estimatedFee = 5;
        serviceAreaName = 'Estimated Service Area (Safe Default)';
      }
      
      setTravelCalculation({
        distance: estimatedDistance,
        duration: Math.round(estimatedDistance * 1.5), // ~1.5 minutes per mile
        fee: Math.round(estimatedFee * 100) / 100, // Round to nearest cent
        withinServiceArea: estimatedDistance <= 25, // Conservative estimate
        serviceAreaName
      });
      
      handleLocationChange('calculatedDistance', estimatedDistance);
      
      // TODO: Send error to monitoring service in production
      // await trackError('travel_calculation_failure', errorDetails);
    } finally {
      setCalculating(false);
    }
  }, [watchedLocation, watchedLocationType, watchedServiceType, handleLocationChange]);

  // Trigger calculation when address changes
  useEffect(() => {
    const timer = setTimeout(calculateTravel, 1000);
    return () => clearTimeout(timer);
  }, [calculateTravel]);

  // Enhanced address autocomplete with comprehensive error handling
  const handleAddressInput = async (address: string) => {
    handleLocationChange('address', address);
    
    if (address.length > 3) {
      try {
        // Use real Google Places API instead of mock
        const { UnifiedDistanceService } = await import('@/lib/maps/unified-distance-service');
        const predictions = await UnifiedDistanceService.getPlacePredictions(address);
        
        // Validate predictions response
        if (!predictions || !Array.isArray(predictions)) {
          throw new Error('Invalid predictions response from service');
        }

        if (predictions.length === 0) {
          // No predictions found - show helpful fallback
          const fallbackSuggestions: AddressSuggestion[] = [
            {
              address: `${address} (no matches found - enter complete address)`,
              city: 'Houston',
              state: 'TX',
              zipCode: '77001',
              confidence: 0.3
            }
          ];
          setAddressSuggestions(fallbackSuggestions);
          setShowSuggestions(true);
          
          // Log for monitoring
          console.warn('No address predictions found', { 
            input: address, 
            length: address.length,
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // Convert Google Places predictions to our suggestion format with enhanced validation
        const suggestions: AddressSuggestion[] = predictions.map(prediction => {
          try {
            // Validate prediction structure
            if (!prediction.structuredFormatting) {
              throw new Error('Missing structured formatting in prediction');
            }

            // Extract city, state, zip from secondary text with better parsing
            const secondary = prediction.structuredFormatting.secondaryText || '';
            const parts = secondary.split(', ');
            
            // Enhanced parsing logic
            let city = 'Houston';
            let state = 'TX';
            let zipCode = '77001';
            
            if (parts.length >= 1 && parts[0]) {
              city = parts[0].trim();
            }
            
            if (parts.length >= 2 && parts[1]) {
              const stateZipMatch = parts[1].match(/^([A-Z]{2})\s*(\d{5})?/);
              if (stateZipMatch) {
                state = stateZipMatch[1];
                if (stateZipMatch[2]) {
                  zipCode = stateZipMatch[2];
                }
              }
            }
            
            return {
              address: prediction.structuredFormatting.mainText || address,
              city,
              state,
              zipCode,
              confidence: 0.9,
              latitude: undefined,
              longitude: undefined
            };
          } catch (parseError) {
            console.warn('Failed to parse prediction', { prediction, error: parseError });
            // Return safe fallback for this prediction
            return {
              address: prediction.description || address,
              city: 'Houston',
              state: 'TX',
              zipCode: '77001',
              confidence: 0.7
            };
          }
        });
        
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
        
        // Log successful prediction for monitoring
        console.log('Address predictions loaded successfully', {
          input: address,
          resultCount: suggestions.length,
          timestamp: new Date().toISOString()
        });

        // Update service status
        setAddressServiceStatus('normal');
        
      } catch (error) {
        console.error('Address prediction failed:', error);
        
        // Enhanced error tracking
        const errorDetails = {
          input: address,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          timestamp: new Date().toISOString(),
          stackTrace: error instanceof Error ? error.stack : undefined
        };
        
        // Log error for monitoring and debugging
        console.error('CRITICAL: Address prediction system failure', errorDetails);

        // Update service status to indicate degraded service
        setAddressServiceStatus('degraded');
        
        // Show user-friendly fallback with clear indication of service issue
        const fallbackSuggestions: AddressSuggestion[] = [
          {
            address: `${address} (address service temporarily unavailable)`,
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            confidence: 0.5
          },
          {
            address: `Continue with: ${address}`,
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            confidence: 0.4
          }
        ];
        setAddressSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
        
        // TODO: Send error to monitoring service in production
        // await trackError('address_prediction_failure', errorDetails);
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
                  <div className="relative">
                    <Input
                      id="location.address"
                      placeholder="123 Main Street, Apt 4B"
                      value={watchedLocation.address || ''}
                      onChange={(e) => handleAddressInput(e.target.value)}
                      className={`${errors?.location?.address ? 'border-red-500' : ''} ${
                        addressServiceStatus === 'degraded' ? 'border-orange-300 bg-orange-50' : ''
                      }`}
                    />
                    {addressServiceStatus === 'degraded' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      </div>
                    )}
                  </div>
                  
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

                {/* Service Status Indicators */}
                {(addressServiceStatus === 'degraded' || travelServiceStatus === 'degraded') && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium text-orange-900">Service Notice</div>
                        <div className="text-sm text-orange-800">
                          {addressServiceStatus === 'degraded' && (
                            <div>• Address suggestions are temporarily limited</div>
                          )}
                          {travelServiceStatus === 'degraded' && (
                            <div>• Travel calculations are using estimated values</div>
                          )}
                          <div className="mt-1 text-xs">
                            Pricing accuracy will be verified during booking confirmation.
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

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
                    {travelServiceStatus === 'degraded' && (
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-orange-600">(Estimated)</span>
                      </div>
                    )}
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