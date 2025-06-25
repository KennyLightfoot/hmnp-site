"use client";

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CalendarDays, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay, isToday, isTomorrow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    startTime: string;
    endTime: string;
  };
  businessTimezone: string;
  clientTimezone: string;
  date: string;
  message?: string;
  error?: string;
  serviceInfo?: {
    name: string;
    duration: number;
    price: number;
  };
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
  const [retryCount, setRetryCount] = useState(0);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  // Detect user timezone when component mounts
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detectedTimezone);
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

  const fetchAvailability = async (selectedDate: Date, retry = false) => {
    if (!retry) {
      setLoading(true);
      setTimeSlots([]);
      setAvailabilityMessage('');
    }

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({
        date: dateString,
        serviceDuration: serviceDuration.toString(),
        serviceId: serviceId,
        timezone: userTimezone
      });

      const response = await fetch(`/api/availability?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const data: AvailabilityResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      // Filter only available slots
      const availableSlots = data.availableSlots?.filter(slot => slot.available) || [];
      
      setTimeSlots(availableSlots);
      setBusinessHours(data.businessHours);
      setServiceInfo(data.serviceInfo);
      setAvailabilityMessage(data.message || '');
      setRetryCount(0);

      if (availableSlots.length === 0) {
        const message = data.message || 'No available time slots for this date.';
        setAvailabilityMessage(message);
        
        if (!retry) {
          toast({
            title: 'No availability',
            description: message,
            variant: 'default'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load availability';
      setAvailabilityMessage(errorMessage);
      
      if (!retry) {
        toast({
          title: 'Error loading availability',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    setDate(selectedDate);
    setTimeSlots([]);
    setAvailabilityMessage('');
    
    // Clear any previously selected time since we're changing dates
    if (date && !isSameDay(date, selectedDate)) {
      // Date changed, clear selection
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!date) return;
    
    try {
      onDateTimeSelect(date, timeSlot.startTime);
      
      toast({
        title: 'Time selected',
        description: `${getDateLabel(date)} at ${formatTimeDisplay(timeSlot.startTime)}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error selecting time:', error);
      toast({
        title: 'Selection failed',
        description: 'Unable to select this time slot. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRetry = () => {
    if (date && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchAvailability(date, true);
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
      return time; // Fallback to original if parsing fails
    }
  };

  const getDateLabel = (selectedDate: Date) => {
    if (isToday(selectedDate)) return 'Today';
    if (isTomorrow(selectedDate)) return 'Tomorrow';
    return format(selectedDate, 'EEEE, MMMM do');
  };

  return (
    <div className="space-y-6">
      {/* Service Info Banner */}
      {serviceInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{serviceInfo.name}</strong> - Duration: {serviceInfo.duration} minutes - Starting at ${serviceInfo.price}
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar Selection */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Select a Date
          </CardTitle>
          <CardDescription>
            Choose your preferred appointment date. Available dates are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border mx-auto"
            classNames={{
              day_selected: "bg-blue-600 text-white hover:bg-blue-700",
              day_today: "bg-blue-100 text-blue-900 font-semibold",
            }}
          />
        </CardContent>
      </Card>

      {/* Time Selection */}
      {date && (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Select a Time for {getDateLabel(date)}
            </CardTitle>
            <CardDescription>
              {businessHours && (
                <>Available times based on business hours: {businessHours.startTime} - {businessHours.endTime}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading available times...</p>
                </div>
              </div>
            ) : availabilityMessage && timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Times</h3>
                <p className="text-gray-600 mb-4">{availabilityMessage}</p>
                {retryCount < 3 && (
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    className="mr-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setDate(undefined)}
                >
                  Choose Different Date
                </Button>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {timeSlots.length} available time{timeSlots.length !== 1 ? 's' : ''} found
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTime === slot.startTime ? "default" : "outline"}
                      className={`
                        h-12 flex flex-col items-center justify-center p-2 text-sm
                        ${selectedTime === slot.startTime 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'hover:bg-blue-50 hover:border-blue-300'
                        }
                      `}
                      onClick={() => handleTimeSelect(slot)}
                    >
                      <div className="font-medium">
                        {formatTimeDisplay(slot.startTime.split('T')[1]?.substring(0, 5) || slot.startTime)}
                      </div>
                      <div className="text-xs opacity-75">
                        {serviceDuration} min
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a date to see available times</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timezone Info */}
      {userTimezone && (
        <div className="text-xs text-gray-500 text-center">
          Times shown in your timezone: {userTimezone.replace('_', ' ')}
        </div>
      )}
    </div>
  );
} 