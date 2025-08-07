'use client';

/**
 * Enhanced Scheduling Step - Houston Mobile Notary Pros
 * Phase 2: Real-time availability with urgency indicators and demand tracking
 * 
 * Features:
 * - Real-time GHL calendar integration
 * - Urgency indicators for same-day/next-day bookings
 * - Demand tracking with visual feedback
 * - Popular time highlighting
 * - Recommended slot suggestions
 * - Mobile-optimized interface
 * - Flexible scheduling options
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Zap, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  MapPin,
  Phone
} from 'lucide-react';

import { CreateBooking } from '@/lib/booking-validation';
import { SchedulingStepProps } from '@/lib/types/booking-interfaces';
import EnhancedTimeSlotDisplay, { EnhancedTimeSlot } from '../EnhancedTimeSlotDisplay';
import { getServiceId } from '@/lib/services/serviceIdMap';
import { debugApiResponse } from '@/lib/api-debug';

// Urgency selection removed - simplified booking flow

interface AvailableDay {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isTomorrow: boolean;
  available: boolean;
  loading: boolean;
  error?: string;
  slots: EnhancedTimeSlot[];
  sameDay: boolean;
  popularCount: number;
  urgentCount: number;
}

export default function EnhancedSchedulingStep({ 
  data, 
  onUpdate, 
  errors, 
  pricing 
}: SchedulingStepProps) {
  const { watch, setValue, formState } = useFormContext<CreateBooking>();
  const watchedScheduling = watch('scheduling');
  const watchedServiceType = watch('serviceType');
  
  // State management
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Generate available days for the next 4 weeks
  const generateAvailableDays = useCallback(() => {
    const days: AvailableDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      const dateString = date.toISOString().split('T')[0];
      
      if (!dateString) continue;
      
      days.push({
        date: dateString,
        dayName,
        dayNumber,
        isToday: i === 0,
        isTomorrow: i === 1,
        available: true,
        loading: false,
        slots: [],
        sameDay: i === 0,
        popularCount: 0,
        urgentCount: 0
      });
    }
    
    return days;
  }, []);

  // Initialize available days
  useEffect(() => {
    const days = generateAvailableDays();
    setAvailableDays(days);
  }, [generateAvailableDays]);

  // ✅ FIXED: Fetch availability for a specific date with deduplication
  const fetchAvailability = useCallback(async (date: string) => {
    if (!watchedServiceType) return;
    
    setIsLoadingAvailability(true);
    setAvailabilityError(null);
    
    try {
      if (!watchedServiceType) {
        throw new Error('Service type is required');
      }
      
      // Use cached availability fetching
      const { fetchAvailabilityCached } = await import('@/lib/utils/availability-cache');
      const result = await fetchAvailabilityCached(watchedServiceType, date, 'America/Chicago');
      
      console.log(`✅ EnhancedSchedulingStep availability for ${date}:`, result);
      
      if (result.availableSlots) {
        // Transform to enhanced format
        const enhancedSlots = result.availableSlots.map((slot: any) => ({
          startTime: `${date}T${slot.startTime}:00`,
          endTime: `${date}T${slot.endTime}:00`,
          displayTime: slot.startTime,
          duration: 60,
          available: slot.available,
          popular: false,
          urgent: false,
          demand: 'low' as const,
          recommended: false,
          sameDay: false,
          nextDay: false
        })).filter((slot: any) => slot.available);
        
        // Update the day with availability data
        setAvailableDays(prev => prev.map(day => {
          if (day.date === date) {
            return {
              ...day,
              loading: false,
              slots: enhancedSlots,
              popularCount: enhancedSlots.filter((s: any) => s.popular).length,
              urgentCount: enhancedSlots.filter((s: any) => s.urgent).length,
              error: undefined
            };
          }
          return day;
        }));
      } else {
        throw new Error(result.message || 'Failed to fetch availability');
      }
    } catch (error) {
      console.error('Availability fetch error:', getErrorMessage(error));
      setAvailabilityError(error instanceof Error ? getErrorMessage(error) : 'Failed to load availability');
      
      // Update the day with error
      setAvailableDays(prev => prev.map(day => {
        if (day.date === date) {
          return {
            ...day,
            loading: false,
            error: error instanceof Error ? getErrorMessage(error) : 'Failed to load availability'
          };
        }
        return day;
      }));
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [watchedServiceType]);

  // Prefetch availability for current week
  useEffect(() => {
    if (watchedServiceType && availableDays.length > 0) {
      const currentWeekDays = availableDays.slice(currentWeek * 7, (currentWeek + 1) * 7);
      currentWeekDays.forEach(day => {
        if (day.available && !day.loading && day.slots.length === 0) {
          fetchAvailability(day.date);
        }
      });
    }
  }, [watchedServiceType, currentWeek, availableDays, fetchAvailability]);

  // Urgency selection removed - simplified booking flow

  // Handle date selection
  const handleDateSelect = (date: string) => {
    try {
      console.log(`📅 Date selected: ${date}`);
      setSelectedDate(date);
      setValue('scheduling.preferredDate', date);
      onUpdate({ scheduling: { ...watchedScheduling, preferredDate: date } });
      
      // Clear previous time selection
      setValue('scheduling.preferredTime', '');
      onUpdate({ 
        scheduling: { 
          ...watchedScheduling, 
          preferredDate: date,
          preferredTime: ''
        } 
      });
    } catch (error) {
      console.error('Date selection error:', error);
      setAvailabilityError('Error selecting date. Please try again.');
    }
  };

  // Handle time slot selection
  const handleTimeSelect = (slot: EnhancedTimeSlot) => {
    try {
      console.log(`⏰ Time selected: ${slot.displayTime}`);
      // Ensure time is in HH:MM format for validation
      const formattedTime = slot.displayTime;
      setValue('scheduling.preferredTime', formattedTime);
      setValue('scheduling.estimatedDuration', slot.duration);
      onUpdate({ 
        scheduling: { 
          ...watchedScheduling, 
          preferredTime: formattedTime,
          estimatedDuration: slot.duration
        } 
      });
    } catch (error) {
      console.error('Time selection error:', error);
      setAvailabilityError('Error selecting time. Please try again.');
    }
  };

  // Get selected day data
  const selectedDay = availableDays.find(day => day.date === selectedDate);
  const hasSelectedTime = !!watchedScheduling.preferredTime;

  // Navigation helpers
  const canGoPrevious = currentWeek > 0;
  const canGoNext = currentWeek < 3; // 4 weeks total

  const goToPreviousWeek = () => {
    if (canGoPrevious) {
      setCurrentWeek(prev => prev - 1);
    }
  };

  const goToNextWeek = () => {
    if (canGoNext) {
      setCurrentWeek(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span>Select a Date</span>
            {isLoadingAvailability && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </CardTitle>
          <CardDescription>
            Choose your preferred appointment date
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            
            <div className="text-sm font-medium">
              Week {currentWeek + 1} of 4
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              disabled={!canGoNext}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {availableDays.slice(currentWeek * 7, (currentWeek + 1) * 7).map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => day.available && !day.loading && handleDateSelect(day.date)}
                disabled={!day.available || day.loading}
                className={`
                  p-3 rounded-lg border text-center transition-all duration-200 relative
                  ${!day.available 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : selectedDate === day.date
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200'
                  }
                `}
              >
                {day.loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
                <div className="text-xs font-medium">{day.dayName}</div>
                <div className="text-lg font-bold">{day.dayNumber}</div>
                {day.isToday && (
                  <div className="text-xs text-orange-600 font-medium">Today</div>
                )}
                {day.isTomorrow && (
                  <div className="text-xs text-blue-600 font-medium">Tomorrow</div>
                )}
                {day.slots.length > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    {day.slots.length} slots
                  </div>
                )}
                {day.popularCount > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    <Star className="h-2 w-2 mr-1" />
                    {day.popularCount}
                  </Badge>
                )}
                {day.urgentCount > 0 && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    <Zap className="h-2 w-2 mr-1" />
                    {day.urgentCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Service availability note */}
          {watchedServiceType === 'STANDARD_NOTARY' && (
            <Alert className="border-gray-200 bg-gray-50">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Standard Notary service is available Monday-Friday, 9 AM - 5 PM.
                Need weekend service? Consider our Extended Hours option.
              </AlertDescription>
            </Alert>
          )}

          {/* Real-time availability status */}
          <Alert className="border-green-200 bg-green-50 mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              ✅ <strong>Real-time availability:</strong> Times shown are pulled directly from our calendar system.
              Data refreshes automatically as you browse dates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Available Times</span>
              <Badge variant="outline">
                {selectedDay.dayName} {selectedDay.dayNumber}
              </Badge>
              {selectedDay.loading && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </CardTitle>
            <CardDescription>
              Select your preferred appointment time
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {selectedDay.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedDay.error}. Please try refreshing or selecting a different date.
                </AlertDescription>
              </Alert>
            ) : selectedDay.slots.length === 0 ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available times for this date. Try selecting a different date or contact us directly.
                </AlertDescription>
              </Alert>
            ) : (
              <EnhancedTimeSlotDisplay
                slots={selectedDay.slots}
                selectedSlot={selectedDay.slots.find(s => s.displayTime === watchedScheduling.preferredTime)}
                onSlotSelect={handleTimeSelect}
                showDemand={true}
                showUrgency={true}
                showPopular={true}
                showRecommended={true}
                variant="grid"
                serviceType={watchedServiceType}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Selection Summary */}
      {(selectedDate || hasSelectedTime) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedDate && (
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {hasSelectedTime && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {watchedScheduling.preferredTime}
                </span>
              </div>
            )}
            {urgencyData && (
              <div className="flex items-center space-x-2">
                <urgencyData.icon className={`h-4 w-4 ${urgencyData.color}`} />
                <span className="text-sm">{urgencyData.title}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      {availabilityError && (
        <Alert className="border-orange-200 bg-orange-50">
          <Phone className="h-4 w-4" />
          <AlertDescription>
            Having trouble finding a time? Call us at <strong>(713) 555-0123</strong> for immediate assistance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
