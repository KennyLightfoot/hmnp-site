'use client';

/**
 * Combined Location & Scheduling Step
 * Houston Mobile Notary Pros
 * 
 * Streamlined step that combines location and scheduling into one
 * to reduce perceived step count and improve conversion
 */

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import LocationStep from './LocationStep';
import EnhancedSchedulingStep from './EnhancedSchedulingStep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar } from 'lucide-react';

interface LocationAndSchedulingStepProps {
  data?: any;
  onUpdate?: (updates: any) => void;
  errors?: any;
  pricing?: any;
}

export default function LocationAndSchedulingStep({ 
  data, 
  onUpdate, 
  errors, 
  pricing 
}: LocationAndSchedulingStepProps) {
  const { watch } = useFormContext();
  const watchedServiceType = watch('serviceType');
  const watchedLocation = watch('location') || data?.location;
  const watchedScheduling = watch('scheduling') || data?.scheduling;
  
  const [showScheduling, setShowScheduling] = useState(false);
  
  // Auto-show scheduling once location is complete (or if RON)
  // For in-person services, require at least city/ZIP (address can be approximate)
  // This matches the relaxed validation in CreateBookingSchema
  const isLocationComplete = watchedServiceType === 'RON_SERVICES' || 
    (watchedLocation?.city && watchedLocation?.state && watchedLocation?.zipCode);
  
  // Also show scheduling if user has already selected a time (they may have navigated back)
  const hasScheduling = !!(watchedScheduling?.preferredDate && watchedScheduling?.preferredTime);
  
  // Auto-advance to scheduling when location is complete
  useEffect(() => {
    if (isLocationComplete && !showScheduling) {
      setShowScheduling(true);
    }
  }, [isLocationComplete, showScheduling]);

  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div>
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Where Should We Meet?</span>
            </CardTitle>
            <CardDescription>
              {watchedServiceType === 'RON_SERVICES' 
                ? 'No location needed for remote service'
                : 'Enter your address so we can travel to you'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationStep 
              location={watchedLocation}
              serviceType={watchedServiceType}
              onUpdate={onUpdate || (() => {})}
              errors={errors}
              pricing={pricing}
            />
          </CardContent>
        </Card>
      </div>

      {/* Scheduling Section - Show when location is complete, RON, or if scheduling already exists */}
      {(showScheduling || isLocationComplete || hasScheduling) && (
        <>
          <Separator className="my-6" />
          <div>
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>When Would You Like Your Appointment?</span>
                </CardTitle>
                <CardDescription>
                  Select your preferred date and time from available slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedSchedulingStep 
                  data={data || {}}
                  onUpdate={onUpdate || (() => {})}
                  errors={errors}
                  pricing={pricing}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

