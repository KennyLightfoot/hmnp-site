"use client";

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Home, Coffee, Building, Info, Navigation, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { LOCATION_TYPES, type UnifiedBookingFormData } from './types';

interface LocationDetailsProps {
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationDetails({ onLocationChange }: LocationDetailsProps) {
  const { control, setValue, getValues, formState } = useFormContext<UnifiedBookingFormData>();
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationStatus, setAddressValidationStatus] = useState<{
    isValid: boolean;
    message: string;
    suggestions?: string[];
  } | null>(null);
  
  // Watch location type for conditional rendering
  const locationType = useWatch({ control, name: 'locationType' });
  const addressStreet = useWatch({ control, name: 'addressStreet' });
  const addressCity = useWatch({ control, name: 'addressCity' });
  const addressState = useWatch({ control, name: 'addressState' });
  const addressZip = useWatch({ control, name: 'addressZip' });
  
  // Get field errors for validation feedback
  const { errors } = formState;

  // Auto-format ZIP code
  const handleZipChange = (value: string) => {
    const zip = value.replace(/\D/g, '');
    if (zip.length <= 5) {
      setValue('addressZip', zip);
    } else if (zip.length <= 9) {
      setValue('addressZip', `${zip.slice(0, 5)}-${zip.slice(5)}`);
    }
  };

  // Enhanced address validation with geocoding
  const validateAddress = async () => {
    if (!addressStreet || !addressCity || !addressState) {
      setAddressValidationStatus(null);
      return;
    }
    
    setIsValidatingAddress(true);
    setAddressValidationStatus(null);
    
    try {
      const fullAddress = `${addressStreet}, ${addressCity}, ${addressState} ${addressZip || ''}`.trim();
      
      // Use OpenStreetMap Nominatim API for geocoding (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=us`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Check if address is in Houston area (rough bounds)
        const houstonBounds = {
          north: 30.2,
          south: 29.4,
          east: -94.8,
          west: -96.1
        };
        
        const isInServiceArea = 
          lat >= houstonBounds.south && 
          lat <= houstonBounds.north && 
          lng >= houstonBounds.west && 
          lng <= houstonBounds.east;
        
        if (isInServiceArea) {
          setAddressValidationStatus({
            isValid: true,
            message: '✓ Address verified and within service area'
          });
          
          onLocationChange?.({
            lat,
            lng,
            address: result.display_name
          });
        } else {
          setAddressValidationStatus({
            isValid: false,
            message: '⚠ Address is outside our Houston service area. Additional travel fees may apply.',
            suggestions: ['Consider a location closer to Houston', 'Contact us for custom pricing']
          });
        }
      } else {
        setAddressValidationStatus({
          isValid: false,
          message: '❌ Address could not be verified. Please check your input.',
          suggestions: [
            'Double-check street number and name',
            'Verify city and ZIP code',
            'Try a more specific address'
          ]
        });
      }
    } catch (error) {
      console.error('Address validation failed:', error);
      setAddressValidationStatus({
        isValid: false,
        message: '⚠ Unable to validate address. Please ensure it is correct.',
        suggestions: ['Check your internet connection', 'Verify address format']
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Meeting Location
        </h3>
        <p className="text-gray-600 text-sm">
          Where would you like to meet for your notarization appointment?
        </p>
      </div>

      {/* Location Type Selection */}
      <FormField
        control={control}
        name="locationType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Type</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {LOCATION_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={type.value} 
                      id={type.value}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={type.value}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className="peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            {type.value === 'CLIENT_SPECIFIED_ADDRESS' ? (
                              <Home className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Coffee className="h-5 w-5 text-green-600" />
                            )}
                            <CardTitle className="text-base">{type.label}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription>{type.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address Fields */}
      {locationType && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {locationType === 'CLIENT_SPECIFIED_ADDRESS' 
                ? 'Enter the address where we should meet you'
                : 'Enter the public location address'
              }
            </span>
          </div>

          {/* Street Address */}
          <FormField
            control={control}
            name="addressStreet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123 Main Street, Apt 4B"
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                    onBlur={() => {
                      field.onBlur();
                      validateAddress();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="addressCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Houston"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                      onBlur={() => {
                        field.onBlur();
                        validateAddress();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="addressState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="TX"
                      maxLength={2}
                      className="transition-all focus:ring-2 focus:ring-blue-500 uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      onBlur={() => {
                        field.onBlur();
                        validateAddress();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="addressZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="77001"
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        handleZipChange(e.target.value);
                        // Trigger validation after ZIP is updated
                        setTimeout(validateAddress, 300);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Validation Status */}
          {(isValidatingAddress || addressValidationStatus) && (
            <div className="mt-4">
              {isValidatingAddress ? (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Validating address...
                  </AlertDescription>
                </Alert>
              ) : addressValidationStatus && (
                <Alert className={addressValidationStatus.isValid ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}>
                  {addressValidationStatus.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <AlertDescription>
                    <div className={addressValidationStatus.isValid ? 'text-green-800' : 'text-amber-800'}>
                      {addressValidationStatus.message}
                      {addressValidationStatus.suggestions && (
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {addressValidationStatus.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Location Notes */}
          <FormField
            control={control}
            name="locationNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      locationType === 'CLIENT_SPECIFIED_ADDRESS'
                        ? "Parking instructions, apartment/suite number, entry codes, etc."
                        : "Specific meeting spot (e.g., 'table near the window', 'conference room B')"
                    }
                    rows={3}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  Help our notary find you easily with specific details about the location.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Area Notice */}
          <Alert>
            <Navigation className="h-4 w-4" />
            <AlertDescription>
              <strong>Service Area:</strong> We serve the greater Houston area within 20 miles of Texas City (77591). 
              Additional travel fees may apply for locations outside our standard service area.
            </AlertDescription>
          </Alert>

          {/* Location Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Location Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {locationType === 'CLIENT_SPECIFIED_ADDRESS' ? (
                <>
                  <li>• Ensure you have a quiet, well-lit space for signing</li>
                  <li>• Have a flat surface available for document signing</li>
                  <li>• Consider parking availability for our notary</li>
                  <li>• Provide any special entry instructions</li>
                </>
              ) : (
                <>
                  <li>• Choose a quiet location with good lighting</li>
                  <li>• Ensure the venue allows business meetings</li>
                  <li>• Have a table or flat surface for signing</li>
                  <li>• Consider noise level and privacy needs</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}