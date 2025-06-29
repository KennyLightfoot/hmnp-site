"use client";

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Home, Coffee, Building, Info, Navigation } from 'lucide-react';
import { LOCATION_TYPES, type UnifiedBookingFormData } from './types';

interface LocationDetailsProps {
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationDetails({ onLocationChange }: LocationDetailsProps) {
  const { control, setValue, getValues } = useFormContext<UnifiedBookingFormData>();
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  
  // Watch location type for conditional rendering
  const locationType = useWatch({ control, name: 'locationType' });
  const addressStreet = useWatch({ control, name: 'addressStreet' });
  const addressCity = useWatch({ control, name: 'addressCity' });
  const addressState = useWatch({ control, name: 'addressState' });

  // Auto-format ZIP code
  const handleZipChange = (value: string) => {
    const zip = value.replace(/\D/g, '');
    if (zip.length <= 5) {
      setValue('addressZip', zip);
    } else if (zip.length <= 9) {
      setValue('addressZip', `${zip.slice(0, 5)}-${zip.slice(5)}`);
    }
  };

  // Validate address (simulate API call)
  const validateAddress = async () => {
    if (!addressStreet || !addressCity || !addressState) return;
    
    setIsValidatingAddress(true);
    try {
      // Simulate address validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coordinates
      const mockLocation = {
        lat: 29.7604 + (Math.random() - 0.5) * 0.1,
        lng: -95.3698 + (Math.random() - 0.5) * 0.1,
        address: `${addressStreet}, ${addressCity}, ${addressState}`
      };
      
      onLocationChange?.(mockLocation);
    } catch (error) {
      console.error('Address validation failed:', error);
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
                      onChange={(e) => handleZipChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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