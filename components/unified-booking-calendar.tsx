"use client";

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, endOfDay, parseISO, isToday, addHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, CalendarDays, Loader2 } from 'lucide-react';

// Unified types for all calendar implementations
export interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedTime: string;
  available?: boolean;
  clientStartTime?: string;
  clientEndTime?: string;
  clientTimezone?: string;
  businessTimezone?: string;
}

export interface BookingCalendarProps {
  // Service configuration
  serviceType?: string;
  serviceId?: string;
  serviceDuration?: number;
  numberOfSigners?: number;
  
  // Callback functions
  onDateTimeSelect?: (date: Date, time: string) => void;
  onTimeSelected?: (startTime: string, endTime: string, formattedTime: string, calendarId?: string) => void;
  
  // Optional props
  selectedDate?: Date;
  selectedTime?: string;
  className?: string;
  
  // Advanced configuration
  existingBookings?: Array<{
    date: string;
    times: string[];
  }>;
  serviceDateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  
  // UI configuration
  variant?: 'compact' | 'full' | 'popover';
  showBusinessHours?: boolean;
  showTimezoneInfo?: boolean;
  maxAdvanceDays?: number;
}

interface AvailabilityResponse {
  success: boolean;
  availableSlots: TimeSlot[];
  businessHours?: {
    open: string;
    close: string;
  };
  message?: string;
  error?: string;
}

/**
 * Unified Booking Calendar Component
 * 
 * Consolidates functionality from:
 * - AppointmentCalendar
 * - BookingCalendar 
 * - CalendarSelector
 * 
 * Provides flexible calendar and time slot selection with:
 * - Multiple API endpoint support
 * - Timezone handling
 * - Service-specific business rules
 * - Responsive design
 * - Accessibility features
 */
export default function UnifiedBookingCalendar({
  serviceType,
  serviceId,
  serviceDuration,
  numberOfSigners = 1,
  onDateTimeSelect,
  onTimeSelected,
  selectedDate: initialSelectedDate,
  selectedTime,
  className,
  existingBookings = [],
  serviceDateRange = {},
  variant = 'full',
  showBusinessHours = true,
  showTimezoneInfo = true,
  maxAdvanceDays = 60
}: BookingCalendarProps) {
  
  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessHours, setBusinessHours] = useState<any>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [determinedCalendarId, setDeterminedCalendarId] = useState<string>('');
  
  // Create booking map for quick lookup
  const [bookedDateMap, setBookedDateMap] = useState<Record<string, string[]>>({});
  
  // Detect user timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detectedTimezone);
    } catch (error) {
      console.warn('Could not detect timezone:', error);
      setUserTimezone('America/Chicago'); // Fallback
    }
  }, []);
  
  // Process existing bookings
  useEffect(() => {
    if (existingBookings && existingBookings.length > 0) {
      const bookingsMap: Record<string, string[]> = {};
      
      existingBookings.forEach(booking => {
        if (!bookingsMap[booking.date]) {
          bookingsMap[booking.date] = [];
        }
        bookingsMap[booking.date] = [...bookingsMap[booking.date], ...booking.times];
      });
      
      setBookedDateMap(bookingsMap);
    }
  }, [existingBookings]);
  
  /**
   * Get calendar ID based on service type and number of signers
   */
  const getCalendarId = (service: string, signers: number): string => {
    if (!service) return 'r9koQ0kxmuMuWryZkjdo'; // Default fallback
    
    switch (service.toLowerCase()) {
      case 'standard-notary':
        if (signers === 1) return 'r9koQ0kxmuMuWryZkjdo';
        if (signers === 2) return 'wkTW5ZX4EMl5hOAbCk9D';
        return 'Vy3hd6Or6Xi2ogW0mvEG'; // 3+ signers
      case 'extended-hours-notary':
        return 'xtHXReq1dfd0wGA7dLc0';
      case 'loan-signing-specialist':
        return 'EJ5ED9UXPHCjBePUTJ0W';
      case 'specialty-notary-service':
        return 'h4X7cZ0mZ3c52XSzvpjU';
      case 'business-solutions':
        return 'r9koQ0kxmuMuWryZkjdo'; // Use default for now
      case 'support-service':
        return 'r9koQ0kxmuMuWryZkjdo'; // Use default for now
      // Legacy support (remove after migration)
      case 'essential':
        console.warn('Legacy service type "essential" detected, please update to "standard-notary"');
        if (signers === 1) return 'r9koQ0kxmuMuWryZkjdo';
        if (signers === 2) return 'wkTW5ZX4EMl5hOAbCk9D';
        return 'Vy3hd6Or6Xi2ogW0mvEG';
      case 'priority':
        console.warn('Legacy service type "priority" detected, please update to "extended-hours-notary"');
        return 'xtHXReq1dfd0wGA7dLc0';
      case 'loan-signing':
      case 'reverse-mortgage':
        console.warn('Legacy service type detected, please update to "loan-signing-specialist"');
        return 'EJ5ED9UXPHCjBePUTJ0W';
      case 'specialty':
        console.warn('Legacy service type "specialty" detected, please update to "specialty-notary-service"');
        return 'h4X7cZ0mZ3c52XSzvpjU';
      default:
        console.warn(`Unknown service type: ${service}, using fallback`);
        return 'r9koQ0kxmuMuWryZkjdo';
    }
  };
  
  /**
   * Get appointment duration based on service type
   */
  const getDuration = (service?: string): number => {
    if (serviceDuration) return serviceDuration;
    if (!service) return 60;
    
    switch (service.toLowerCase()) {
      case 'loan-signing-specialist':
        return 90; // SOP: 90-minute session for loan signing
      case 'extended-hours-notary':
        return 60; // SOP: Standard duration
      case 'standard-notary':
      case 'specialty-notary-service':
      case 'business-solutions':
      case 'support-service':
        return 60; // SOP: Standard duration
      // Legacy support (remove after migration)
      case 'loan-signing':
      case 'reverse-mortgage':
        console.warn('Legacy service type detected, please update to "loan-signing-specialist"');
        return 90;
      case 'priority':
        console.warn('Legacy service type "priority" detected, please update to "extended-hours-notary"');
        return 60;
      case 'essential':
      case 'specialty':
        console.warn('Legacy service type detected, please update to SOP-compliant types');
        return 60;
      default:
        return 60;
    }
  };
  
  /**
   * Fetch available time slots
   */
  const fetchAvailability = async (date: Date) => {
    if (!date || !userTimezone) return;
    
    setLoading(true);
    setError(null);
    setTimeSlots([]);
    setAvailabilityMessage('');
    
    try {
      const duration = getDuration(serviceType);
      let apiUrl: string;
      let params: URLSearchParams;
      
      // Determine which API endpoint to use
      if (serviceType && numberOfSigners) {
        // Use calendar-based API (AppointmentCalendar style)
        const calendarId = getCalendarId(serviceType, numberOfSigners);
        setDeterminedCalendarId(calendarId);
        
        const startDateISO = format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ssXXX");
        const endDateISO = format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ssXXX");
        
        params = new URLSearchParams({
          calendarId,
          startDate: startDateISO,
          endDate: endDateISO,
          duration: duration.toString(),
          timezone: userTimezone
        });
        
        apiUrl = `/api/calendar/available-slots?${params}`;
      } else if (serviceId) {
        // Use service-based API (BookingCalendar style)
        const dateString = format(date, 'yyyy-MM-dd');
        
        params = new URLSearchParams({
          date: dateString,
          serviceDuration: duration.toString(),
          serviceId,
          timezone: userTimezone
        });
        
        apiUrl = `/api/availability?${params}`;
      } else {
        // Fallback to simple calendar API (CalendarSelector style)
        const startDate = format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ss'Z'");
        const endDate = format(endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss'Z'");
        
        params = new URLSearchParams({
          serviceType: serviceType || 'essential',
          startDate,
          endDate,
          duration: duration.toString(),
          timezone: userTimezone
        });
        
        apiUrl = `/api/calendar/available-slots?${params}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `API Error: ${response.status} ${response.statusText}` 
        }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch availability');
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      let slots: TimeSlot[] = [];
      
      if (data.success) {
        if (data.availableSlots) {
          // BookingCalendar format
          slots = data.availableSlots;
          setBusinessHours(data.businessHours);
          setAvailabilityMessage(data.message || '');
        } else if (data.data) {
          // Calendar API format
          const dateKey = format(date, 'yyyy-MM-dd');
          const slotsForDate = data.data[dateKey]?.slots || data.data.slots;
          
          if (Array.isArray(slotsForDate)) {
            slots = slotsForDate
              .map((startTimeString: string) => {
                try {
                  const start = parseISO(startTimeString);
                  
                  // Filter past times
                  if (start < new Date()) return null;
                  
                  // Check if booked
                  const dateKey = format(start, 'yyyy-MM-dd');
                  if (bookedDateMap[dateKey]?.includes(startTimeString)) return null;
                  
                  const end = addHours(start, duration / 60);
                  
                  return {
                    startTime: startTimeString,
                    endTime: end.toISOString(),
                    formattedTime: format(start, 'hh:mm aa'),
                    available: true
                  };
                } catch (parseError) {
                  console.error('Error parsing slot:', startTimeString, parseError);
                  return null;
                }
              })
              .filter((slot): slot is TimeSlot => slot !== null);
          }
        }
      }
      
      // Apply service-specific rules
      if ((serviceType === 'standard-notary' || serviceType === 'essential') && isToday(date)) {
        const cutoffHour = 15; // 3 PM - SOP: Standard notary cutoff for same-day
        slots = slots.filter(slot => {
          try {
            const startHour = parseISO(slot.startTime).getHours();
            return startHour < cutoffHour;
          } catch {
            return false;
          }
        });
      }
      
      setTimeSlots(slots);
      
      if (slots.length === 0) {
        setError(data.message || 'No available time slots found for this date.');
      }
      
    } catch (error) {
      console.error('Error fetching availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load availability';
      setError(errorMessage);
      
      if (variant !== 'compact') {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch availability when date changes
  useEffect(() => {
    if (selectedDate && userTimezone) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, serviceType, serviceId, numberOfSigners, userTimezone, bookedDateMap]);
  
  /**
   * Handle date selection
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot(undefined);
      setError(null);
      
      // Clear selected time in parent if callback provided
      if (onDateTimeSelect && selectedTime) {
        onDateTimeSelect(date, '');
      }
    }
  };
  
  /**
   * Handle time slot selection
   */
  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    
    // Call appropriate callback
    if (onTimeSelected) {
      onTimeSelected(slot.startTime, slot.endTime, slot.formattedTime, determinedCalendarId);
    }
    
    if (onDateTimeSelect && selectedDate) {
      onDateTimeSelect(selectedDate, slot.startTime);
    }
  };
  
  /**
   * Determine if a date should be disabled
   */
  const isDateDisabled = (date: Date): boolean => {
    if (loading) return true;
    
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Disable dates too far in future
    const maxDate = addDays(today, maxAdvanceDays);
    if (date > maxDate) return true;
    
    // Service-specific rules - SOP: Standard notary weekdays only
    if (serviceType === 'standard-notary' || serviceType === 'essential') {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return true; // No weekends for standard service
    }
    
    // Check service date range
    if (serviceDateRange.startDate && date < serviceDateRange.startDate) return true;
    if (serviceDateRange.endDate && date > serviceDateRange.endDate) return true;
    
    // Check if fully booked
    const dateString = format(date, 'yyyy-MM-dd');
    if (bookedDateMap[dateString]?.length >= 8) return true;
    
    return false;
  };
  
  /**
   * Format time for display
   */
  const formatTimeDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time; // Fallback to original if parsing fails
    }
  };
  
  // Render based on variant
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Select Appointment Date</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {selectedDate && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Select Appointment Time</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setError(null);
                    setSelectedDate(undefined);
                  }}
                >
                  Try Another Date
                </Button>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-800">No available time slots for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedTimeSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                    className="flex items-center justify-center"
                    onClick={() => handleTimeSelect(slot)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {slot.formattedTime}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Full variant (default)
  return (
    <div className={cn('space-y-6', className)}>
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
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      
      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'EEEE, MMMM do, yyyy')}
              {showBusinessHours && businessHours && (
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
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {availabilityMessage || 'No available time slots for this date.'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please try selecting a different date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {showTimezoneInfo && userTimezone && timeSlots[0]?.clientTimezone && 
                 timeSlots[0].clientTimezone !== timeSlots[0].businessTimezone && (
                  <div className="text-sm p-2 bg-blue-50 rounded-md text-blue-800 mb-3">
                    <p className="font-medium">Times displayed in your timezone: {userTimezone}</p>
                    <p className="text-xs mt-1">Business located in {timeSlots[0].businessTimezone}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeSelect(slot)}
                      className="justify-center"
                    >
                      {slot.clientStartTime 
                        ? formatTimeDisplay(slot.clientStartTime)
                        : slot.formattedTime}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Selected Appointment Summary */}
      {selectedDate && selectedTimeSlot && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CalendarDays className="h-4 w-4" />
              <span className="font-medium">
                Selected: {format(selectedDate, 'EEEE, MMMM do, yyyy')} at {selectedTimeSlot.formattedTime}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}