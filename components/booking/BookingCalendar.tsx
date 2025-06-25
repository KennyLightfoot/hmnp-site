"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CalendarDays } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  clientStartTime?: string;
  clientEndTime?: string;
  clientTimezone?: string;
  businessTimezone?: string;
}

interface AvailabilityResponse {
  availableSlots: TimeSlot[];
  businessHours: {
    open: string;
    close: string;
    enabled: boolean;
  };
  businessTimezone: string;
  clientTimezone: string;
  date: string;
  message?: string;
  error?: string;
}

interface BookingCalendarProps {
  serviceId: string;
  serviceDuration: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export default function BookingCalendar({
  serviceId,
  serviceDuration,
  onDateTimeSelect,
  selectedDate,
  selectedTime
}: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [businessHours, setBusinessHours] = useState<any>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Detect user timezone when component mounts
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detectedTimezone);
      console.log('Detected timezone:', detectedTimezone);
    } catch (error) {
      console.warn('Could not detect timezone:', error);
      setUserTimezone('America/Chicago'); // Fallback
    }
  }, []);

  // Fetch availability when date changes or timezone is detected
  useEffect(() => {
    if (date && serviceId && serviceDuration && userTimezone) {
      fetchAvailability(date);
    }
  }, [date, serviceId, serviceDuration, userTimezone]);

  const fetchAvailability = async (selectedDate: Date) => {
    setLoading(true);
    setTimeSlots([]);
    setAvailabilityMessage('');
    setError('');

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      // Build parameters with consistent naming
      const params = new URLSearchParams({
        date: dateString,
        serviceDuration: serviceDuration.toString(), // Use serviceDuration consistently
        serviceId: serviceId,
        timezone: userTimezone
      });

      console.log('Fetching availability with params:', {
        date: dateString,
        serviceDuration: serviceDuration.toString(),
        serviceId: serviceId,
        timezone: userTimezone
      });

      const response = await fetch(`/api/availability?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AvailabilityResponse = await response.json();
      console.log('Availability response:', data);

      if (data.availableSlots && Array.isArray(data.availableSlots)) {
        setTimeSlots(data.availableSlots);
        setBusinessHours(data.businessHours);
        setAvailabilityMessage(data.message || '');

        if (data.availableSlots.length === 0) {
          setAvailabilityMessage(data.message || 'No available time slots for this date.');
          toast({
            title: 'No availability',
            description: data.message || 'No available time slots for this date. Please try selecting a different date.',
            variant: 'destructive'
          });
        }
      } else {
        console.warn('Invalid availability response format:', data);
        setError('Invalid response format from server');
        setTimeSlots([]);
      }

    } catch (error) {
      console.error('Error fetching availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load availability';
      setError(errorMessage);
      setTimeSlots([]);
      toast({
        title: 'Error Loading Times',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Clear selected time when date changes
      if (selectedTime) {
        onDateTimeSelect(newDate, '');
      }
    }
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    if (date) {
      // Use the business timezone time for backend processing
      onDateTimeSelect(date, slot.startTime);
    }
  };

  // Disable past dates and dates too far in the future (60 days)
  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 60)
  };

  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.warn('Error formatting time:', time, error);
      return time; // Fallback to original format
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Select a Date
          </CardTitle>
          <CardDescription>
            Choose your preferred appointment date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times
            </CardTitle>
            <CardDescription>
              {format(date, 'EEEE, MMMM do, yyyy')}
              {businessHours && (
                <span className="block text-sm text-muted-foreground mt-1">
                  Business hours: {formatTimeDisplay(businessHours.startTime)} - {formatTimeDisplay(businessHours.endTime)}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading available times...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 font-medium mb-2">Error Loading Times</div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchAvailability(date)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="space-y-4">
                {userTimezone && timeSlots[0]?.clientTimezone && timeSlots[0].clientTimezone !== timeSlots[0].businessTimezone && (
                  <div className="text-sm p-3 bg-blue-50 rounded-md text-blue-800 border border-blue-200">
                    <p className="font-medium">Times are displayed in your local timezone: {userTimezone}</p>
                    <p className="text-xs mt-1">Business is located in {timeSlots[0].businessTimezone} timezone</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={`${slot.startTime}-${index}`}
                      variant={selectedTime === slot.startTime ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(slot)}
                      className="justify-center hover:scale-105 transition-transform"
                      disabled={!slot.available}
                    >
                      {slot.clientStartTime 
                        ? formatTimeDisplay(slot.clientStartTime)
                        : formatTimeDisplay(slot.startTime)}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {availabilityMessage || 'No available time slots for this date.'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please try selecting a different date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Appointment Summary */}
      {date && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CalendarDays className="h-4 w-4" />
              <span className="font-medium">
                Selected: {format(date, 'EEEE, MMMM do, yyyy')} at {formatTimeDisplay(selectedTime)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 