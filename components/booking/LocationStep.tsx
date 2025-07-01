"use client";

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MapPin, Home, Coffee, Building } from 'lucide-react';

interface LocationStepProps {
  form: UseFormReturn<any>;
}

export function LocationStep({ form }: LocationStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Service Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 gap-4"
                  aria-label="Location type selection"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer touch-target">
                    <RadioGroupItem value="CLIENT_SPECIFIED_ADDRESS" id="client-location" />
                    <Home className="h-5 w-5 text-gray-500" />
                    <label htmlFor="client-location" className="flex-1 cursor-pointer">
                      <div className="font-medium">Your Location</div>
                      <div className="text-sm text-gray-500">Home, office, or specified address</div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer touch-target">
                    <RadioGroupItem value="PUBLIC_PLACE" id="public-place" />
                    <Coffee className="h-5 w-5 text-gray-500" />
                    <label htmlFor="public-place" className="flex-1 cursor-pointer">
                      <div className="font-medium">Public Place</div>
                      <div className="text-sm text-gray-500">Library, coffee shop, etc.</div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer touch-target">
                    <RadioGroupItem value="OUR_OFFICE" id="our-office" />
                    <Building className="h-5 w-5 text-gray-500" />
                    <label htmlFor="our-office" className="flex-1 cursor-pointer">
                      <div className="font-medium">Our Office</div>
                      <div className="text-sm text-gray-500">Visit our notary office</div>
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('locationType') !== 'OUR_OFFICE' && (
          <>
            <FormField
              control={form.control}
              name="addressStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Main Street" 
                      {...field}
                      aria-label="Street address"
                      className="touch-target"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Houston" 
                        {...field}
                        aria-label="City"
                        className="touch-target"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="TX" 
                        {...field}
                        aria-label="State"
                        className="touch-target"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressZip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="77573" 
                        {...field}
                        aria-label="ZIP code"
                        className="touch-target"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Building name, floor, unit number, parking instructions, etc."
                      {...field}
                      aria-label="Location notes"
                      className="touch-target"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}