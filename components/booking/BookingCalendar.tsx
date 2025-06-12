"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CalendarDays } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailabilityResponse {
  availableSlots: string[];
  businessHours: {
    open: string;
    close: string;
    enabled: boolean;
  };
  date: string;
  message?: string;
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
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [businessHours, setBusinessHours] = useState<any>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');

  // Fetch availability when date changes
  useEffect(() => {
    if (date && serviceId && serviceDuration) {
      fetchAvailability(date);
    }
  }, [date, serviceId, serviceDuration]);

  const fetchAvailability = async (selectedDate: Date) => {
    setLoading(true);
    setTimeSlots([]);
    setAvailabilityMessage('');

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({
        date: dateString,
        serviceDuration: serviceDuration.toString(),
        serviceId: serviceId
      });

      const response = await fetch(`/api/availability?${params}`);
      const data: AvailabilityResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch availability');
      }

      setTimeSlots(data.availableSlots);
      setBusinessHours(data.businessHours);
      setAvailabilityMessage(data.message || '');

      if (data.availableSlots.length === 0 && data.message) {
        toast({
          title: 'No availability',
          description: data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load availability',
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

  const handleTimeSelect = (time: string) => {
    if (date) {
      onDateTimeSelect(date, time);
    }
  };

  // Disable past dates and dates too far in the future (60 days)
  const disabledDays = {
    before: startOfDay(new Date()),
    after: addDays(new Date(), 60)
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
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
                  Business hours: {formatTimeDisplay(businessHours.open)} - {formatTimeDisplay(businessHours.close)}
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
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    className="justify-center"
                  >
                    {formatTimeDisplay(time)}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
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