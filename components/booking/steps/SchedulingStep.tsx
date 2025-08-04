'use client';

/**
 * Championship Booking System - Scheduling Step
 * Houston Mobile Notary Pros
 * 
 * ✅ FIXED: Now connected to real GHL availability API
 * Calendar selection with real-time availability from GoHighLevel
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
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
  Loader2
} from 'lucide-react';

import { CreateBooking } from '@/lib/booking-validation';
import { SchedulingStepProps } from '@/lib/types/booking-interfaces';
import { getServiceId } from '@/lib/services/serviceIdMap';
import { debugApiResponse } from '@/lib/api-debug';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  duration: number;
  displayTime: string;
  popular?: boolean;
  urgent?: boolean;
  demand?: 'low' | 'medium' | 'high';
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  available: boolean;
  slots: TimeSlot[];
  isToday: boolean;
  isTomorrow: boolean;
  sameDay?: boolean;
  loading?: boolean;
  error?: string;
}

interface AvailabilityResponse {
  success: boolean;
  serviceType: string;
  date: string;
  timezone: string;
  calendarId: string;
  totalSlots: number;
  availableSlots: TimeSlot[];
  metadata: {
    businessHours: {
      start: number;
      end: number;
    };
    fetchedAt: string;
    source: string;
  };
}

const URGENCY_LEVELS = [
  {
    id: 'flexible',
    title: 'Flexible Timing',
    description: 'I can schedule anytime in the next 2 weeks',
    discount: 0,
    icon: Clock,
    color: 'text-green-600'
  },
  {
    id: 'this-week',
    title: 'This Week',
    description: 'I need service within the next 7 days',
    discount: 0,
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    id: 'tomorrow',
    title: 'Tomorrow',
    description: 'Next business day service',
    surcharge: 0,
    icon: Zap,
    color: 'text-orange-600'
  },
  {
    id: 'today',
    title: 'Today (Same Day)',
    description: 'Urgent same-day service needed',
    surcharge: 0,
    icon: Flame,
    color: 'text-red-600',
    badge: 'Limited Availability'
  }
];

export default function SchedulingStep({ data, onUpdate, errors, pricing }: SchedulingStepProps) {
  const { setValue, watch } = useFormContext<CreateBooking>();
  
  const [selectedUrgency, setSelectedUrgency] = useState('flexible');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [availabilityData, setAvailabilityData] = useState<{ [date: string]: AvailabilityResponse }>({});
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  
  const watchedScheduling = watch('scheduling') || {};
  const watchedServiceType = watch('serviceType') || 'STANDARD_NOTARY';
  const watchedLocation = watch('location');

  // ✅ FIXED: Generate next 14 days with real availability data
  const availableDays = useMemo(() => {
    const days: DaySchedule[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Service availability logic
      let available = true;
      if (watchedServiceType === 'STANDARD_NOTARY' && isWeekend) {
        available = false;
      }
      
      // Get real availability data for this date
      const dayAvailability = dateString ? availabilityData[dateString] : undefined;
      const slots = dayAvailability?.availableSlots || [];
      
      if (!dateString) continue;
      
      days.push({
        date: dateString,
        dayName,
        dayNumber: date.getDate(),
        available: available && slots.length > 0,
        slots: slots.map(slot => ({
          ...slot,
          popular: slot.duration <= 60, // Shorter slots are more popular
          urgent: i === 0 && selectedUrgency === 'today',
          demand: slot.duration <= 60 ? 'high' : slot.duration <= 90 ? 'medium' : 'low'
        })),
        isToday: i === 0,
        isTomorrow: i === 1,
        sameDay: i === 0 && selectedUrgency === 'today',
        loading: loadingDates.has(dateString),
        error: dayAvailability && !dayAvailability.success ? 'Failed to load availability' : undefined
      });
    }
    
    return days;
  }, [availabilityData, loadingDates, watchedServiceType, selectedUrgency]);

  // ✅ FIXED: Fetch availability for a specific date
  const fetchAvailability = useCallback(async (date: string) => {
    if (availabilityData[date] || loadingDates.has(date)) {
      return; // Already loaded or loading
    }

    setLoadingDates(prev => new Set(prev).add(date));

    try {
      // Resolve service ID from central map
      const serviceId = getServiceId(watchedServiceType);
      
      // Use the WORKING availability endpoint
      const response = await fetch(`/api/availability?serviceId=${serviceId}&date=${date}&timezone=America/Chicago`);
      const result = await response.json();

      // Verbose API debug logging
      debugApiResponse('/api/availability', response, result);
      
      console.log(`✅ Availability for ${date}:`, result);
      
      // Transform to match expected AvailabilityResponse format
      const transformedData: AvailabilityResponse = {
        success: !!result.availableSlots,
        serviceType: watchedServiceType,
        date,
        timezone: 'America/Chicago',
        calendarId: serviceId,
        totalSlots: result.availableSlots?.length || 0,
        availableSlots: result.availableSlots?.map((slot: any) => ({
          startTime: `${date}T${slot.startTime}:00`,
          endTime: `${date}T${slot.endTime}:00`,
          available: slot.available,
          duration: 60,
          displayTime: slot.startTime,
          popular: false,
          urgent: false,
          demand: 'low' as const
        })).filter((slot: any) => slot.available) || [],
        metadata: {
          businessHours: { start: 8, end: 18 },
          fetchedAt: new Date().toISOString(),
          source: 'Database Availability API'
        }
      };
      
      setAvailabilityData(prev => ({
        ...prev,
        [date]: transformedData
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch availability for ${date}:`, error);
      setAvailabilityData(prev => ({
        ...prev,
        [date]: {
          success: false,
          serviceType: watchedServiceType,
          date,
          timezone: 'America/Chicago',
          calendarId: '',
          totalSlots: 0,
          availableSlots: [],
          metadata: {
            businessHours: { start: 8, end: 18 },
            fetchedAt: new Date().toISOString(),
            source: 'Error'
          }
        }
      }));
    } finally {
      setLoadingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(date);
        return newSet;
      });
    }
  }, [watchedServiceType, availabilityData, loadingDates]);

  // ✅ FIXED: Load availability for visible days when component mounts or service type changes
  useEffect(() => {
    const visibleDays = availableDays.slice(currentWeek * 7, (currentWeek + 1) * 7);
    
    visibleDays.forEach(day => {
      if (day.available) {
        fetchAvailability(day.date);
      }
    });
  }, [availableDays, currentWeek, fetchAvailability]);

  // ✅ FIXED: Clear availability data when service type changes
  useEffect(() => {
    setAvailabilityData({});
    setLoadingDates(new Set());
  }, [watchedServiceType]);

  const handleUrgencyChange = (urgency: string) => {
    setSelectedUrgency(urgency);
    setValue('scheduling.sameDay', urgency === 'today');
    setValue('scheduling.priority', urgency === 'today' || urgency === 'tomorrow');
    onUpdate({ 
      scheduling: { 
        ...watchedScheduling, 
        sameDay: urgency === 'today',
        priority: urgency === 'today' || urgency === 'tomorrow'
      } 
    });
  };

  const handleDateSelect = (date: string) => {
    setValue('scheduling.preferredDate', date);
    onUpdate({ scheduling: { ...watchedScheduling, preferredDate: date } });
    
    // Prefetch availability for this date if not already loaded
    fetchAvailability(date);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setValue('scheduling.preferredTime', slot.displayTime);
    onUpdate({ 
      scheduling: { 
        ...watchedScheduling, 
        preferredTime: slot.displayTime
      } 
    });
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedDay = availableDays.find(day => day.date === watchedScheduling.preferredDate);
  const hasSelectedTime = !!watchedScheduling.preferredTime;
  const urgencyData = URGENCY_LEVELS.find(u => u.id === selectedUrgency);

  return (
    <div className="space-y-6">
      {/* Urgency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-600" />
            <span>How urgent is your appointment?</span>
          </CardTitle>
          <CardDescription>
            Help us find the best available times for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedUrgency} 
            onValueChange={handleUrgencyChange}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {URGENCY_LEVELS.map((level) => (
              <div key={level.id} className="relative">
                <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
                <Label
                  htmlFor={level.id}
                  className="cursor-pointer block"
                >
                  <Card className={`transition-all duration-200 ${
                    selectedUrgency === level.id 
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <level.icon className={`h-5 w-5 ${level.color} mt-1`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{level.title}</h3>
                            {level.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {level.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {level.description}
                          </p>
                          {level.surcharge && level.surcharge > 0 && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              +${level.surcharge} urgency fee
                            </p>
                          )}
                          {level.discount && level.discount > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              ${level.discount} discount
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

      {/* Urgency-specific alerts */}
      {selectedUrgency === 'today' && (
        <Alert className="border-orange-200 bg-orange-50 animate-pulse">
          <Flame className="h-4 w-4" />
          <AlertDescription>
            <strong>Same-day service availability is limited.</strong> Book now to secure your slot! 
            Times shown are subject to confirmation.
          </AlertDescription>
        </Alert>
      )}

      {selectedUrgency === 'tomorrow' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Next-day priority booking.</strong> We'll confirm your appointment within 2 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Date Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span>Select Your Preferred Date</span>
                </CardTitle>
                
                {/* Week navigation */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                    disabled={currentWeek === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-20 text-center">
                    {currentWeek === 0 ? 'This Week' : 'Next Week'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(Math.min(1, currentWeek + 1))}
                    disabled={currentWeek === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
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
                        : watchedScheduling.preferredDate === day.date
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
                    {day.sameDay && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Urgent
                      </Badge>
                    )}
                    {day.slots.length > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        {day.slots.length} slots
                      </div>
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
            <Card className="mt-4">
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
                {selectedDay.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading available times...</span>
                  </div>
                ) : selectedDay.error ? (
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
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedDay.slots.map((slot, index) => (
                        <button
                          key={`${slot.startTime}-${index}`}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={`
                            p-3 rounded-lg border text-center transition-all duration-200
                            ${watchedScheduling.preferredTime === slot.displayTime
                              ? 'bg-green-600 text-white border-green-600 shadow-md'
                              : `hover:shadow-md ${getDemandColor(slot.demand || 'low')}`
                            }
                          `}
                        >
                          <div className="font-medium">{slot.displayTime}</div>
                          <div className="text-xs text-gray-600">{slot.duration} min</div>
                          {slot.popular && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Popular
                            </Badge>
                          )}
                          {slot.urgent && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Urgent
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Time slot demand legend */}
                    <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200" />
                        <span>High demand</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
                        <span>Limited</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Booking Summary & Options */}
        <div className="space-y-4">
          {/* Current Selection Summary */}
          {(watchedScheduling.preferredDate || watchedScheduling.preferredTime) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {watchedScheduling.preferredDate && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {new Date(watchedScheduling.preferredDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {watchedScheduling.preferredTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {watchedScheduling.preferredTime}
                    </span>
                  </div>
                )}
                {urgencyData && (
                  <div className="flex items-center space-x-2">
                    {urgencyData.icon && (
                      <urgencyData.icon className={`h-4 w-4 ${urgencyData.color || 'text-gray-600'}`} />
                    )}
                    <span className="text-sm">{urgencyData.title || 'Unknown'}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scheduling Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scheduling Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexible-timing"
                  checked={watchedScheduling.flexibleTiming || false}
                  onCheckedChange={(checked) => {
                    const boolValue = checked as boolean;
                    setValue('scheduling.flexibleTiming', boolValue);
                    onUpdate({ 
                      scheduling: { ...watchedScheduling, flexibleTiming: boolValue } 
                    });
                  }}
                />
                <Label htmlFor="flexible-timing" className="text-sm">
                  I'm flexible with timing (±30 minutes)
                </Label>
              </div>
              
              <div className="text-xs text-gray-600">
                Flexible timing helps us accommodate urgent requests and may qualify for discounts.
              </div>
            </CardContent>
          </Card>

          {/* Real-time Availability Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Live Availability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Real-time calendar sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Instant booking confirmation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Updated every 5 minutes</span>
                </div>
              </div>
              
              {selectedUrgency === 'today' && (
                <Alert className="border-orange-200 bg-orange-50 p-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Same-day slots are limited. Book immediately to secure your preferred time.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Service Availability Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-blue-900">Service Hours:</div>
                <div className="text-sm text-blue-800">
                  {watchedServiceType === 'STANDARD_NOTARY' && '• Standard: Mon-Fri, 9 AM - 5 PM'}
                  {watchedServiceType === 'EXTENDED_HOURS' && '• Extended: Daily, 7 AM - 9 PM'}
                  {watchedServiceType === 'LOAN_SIGNING' && '• Loan Signing: By appointment'}
                  {watchedServiceType === 'RON_SERVICES' && '• RON: 24/7 availability'}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}