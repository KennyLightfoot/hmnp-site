/**
 * Real-time Enhanced Calendar Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Calendar with live slot availability updates and collaborative booking prevention
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getClientWebSocketManager } from '@/lib/realtime/client-websocket';
import { SlotAvailabilityIndicator } from './slot-availability-indicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';

interface TimeSlot {
  datetime: string;
  available: boolean;
  viewerCount: number;
  isReserved?: boolean;
  reservationId?: string;
}

interface RealtimeCalendarProps {
  serviceType: string;
  selectedDate?: Date;
  selectedTime?: string;
  onSlotSelect?: (datetime: string) => void;
  onAvailabilityChange?: (slots: TimeSlot[]) => void;
  className?: string;
}

export function RealtimeCalendar({
  serviceType,
  selectedDate,
  selectedTime,
  onSlotSelect,
  onAvailabilityChange,
  className = ''
}: RealtimeCalendarProps) {
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conflictSlots, setConflictSlots] = useState<Set<string>>(new Set());
  const [wsManager] = useState(() => getClientWebSocketManager());

  // Generate time slots for the selected date
  const generateTimeSlots = useCallback((selectedDate: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const datetime = new Date(selectedDate);
        datetime.setHours(hour, minute, 0, 0);
        
        slots.push({
          datetime: datetime.toISOString(),
          available: true,
          viewerCount: 0
        });
      }
    }
    
    return slots;
  }, []);

  // Load initial slot availability
  const loadSlotAvailability = useCallback(async (selectedDate: Date) => {
    setIsLoading(true);
    try {
      const slots = generateTimeSlots(selectedDate);
      
      // Check availability for each slot
      for (const slot of slots) {
        // This would typically call an API to check availability
        // For now, we'll simulate some unavailable slots
        const hour = new Date(slot.datetime).getHours();
        if (hour === 12 || hour === 15) {
          slot.available = false;
        }
      }
      
      setTimeSlots(slots);
      onAvailabilityChange?.(slots);
    } catch (error) {
      console.error('Failed to load slot availability:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateTimeSlots, onAvailabilityChange]);

  // Set up WebSocket connection
  useEffect(() => {
    wsManager.setEventHandlers({
      onConnected: () => {
        setIsConnected(true);
      },
      onDisconnected: () => {
        setIsConnected(false);
      },
      onSlotAvailable: (update) => {
        if (update.serviceType === serviceType) {
          setTimeSlots(prev => prev.map(slot => 
            slot.datetime === update.datetime 
              ? { ...slot, available: true, viewerCount: update.viewerCount }
              : slot
          ));
          
          // Remove from conflict set
          setConflictSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(update.datetime);
            return newSet;
          });
        }
      },
      onSlotUnavailable: (update) => {
        if (update.serviceType === serviceType) {
          setTimeSlots(prev => prev.map(slot => 
            slot.datetime === update.datetime 
              ? { 
                  ...slot, 
                  available: false, 
                  viewerCount: update.viewerCount,
                  isReserved: true,
                  reservationId: update.reservationId
                }
              : slot
          ));
        }
      },
      onSlotViewingCount: (update) => {
        if (update.serviceType === serviceType) {
          setTimeSlots(prev => prev.map(slot => 
            slot.datetime === update.datetime 
              ? { ...slot, viewerCount: update.viewerCount }
              : slot
          ));
        }
      },
      onReservationConflict: (data) => {
        if (data.serviceType === serviceType) {
          setConflictSlots(prev => new Set(prev).add(data.datetime));
          // Auto-clear conflict after 5 seconds
          setTimeout(() => {
            setConflictSlots(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.datetime);
              return newSet;
            });
          }, 5000);
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    // Connect and subscribe
    wsManager.connect();
    wsManager.subscribeToSlotUpdates();

    return () => {
      wsManager.disconnect();
    };
  }, [wsManager, serviceType]);

  // Load slots when date changes
  useEffect(() => {
    loadSlotAvailability(date);
  }, [date, loadSlotAvailability]);

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle time slot selection
  const handleSlotSelect = (datetime: string) => {
    const slot = timeSlots.find(s => s.datetime === datetime);
    if (slot && slot.available) {
      onSlotSelect?.(datetime);
    }
  };

  // Format time for display
  const formatTime = (datetime: string) => {
    return format(new Date(datetime), 'h:mm a');
  };

  // Get slot status styling
  const getSlotStyling = (slot: TimeSlot) => {
    const hasConflict = conflictSlots.has(slot.datetime);
    const isSelected = selectedTime === slot.datetime;
    
    let baseClasses = 'p-2 rounded-lg border text-sm transition-all cursor-pointer';
    
    if (hasConflict) {
      return `${baseClasses} border-red-500 bg-red-50 text-red-700 animate-pulse`;
    }
    
    if (!slot.available) {
      return `${baseClasses} border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }
    
    if (isSelected) {
      return `${baseClasses} border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200`;
    }
    
    if (slot.viewerCount > 3) {
      return `${baseClasses} border-orange-400 bg-orange-50 text-orange-700 hover:bg-orange-100`;
    }
    
    return `${baseClasses} border-green-400 bg-green-50 text-green-700 hover:bg-green-100`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Date & Time</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Live Updates
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker */}
        <div>
          <h4 className="font-medium mb-3">Choose Date</h4>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => date < startOfDay(new Date())}
            className="rounded-md border"
          />
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-medium mb-3">
            Available Times - {format(date, 'EEEE, MMMM d')}
          </h4>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading availability...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((slot) => (
                <div
                  key={slot.datetime}
                  className={getSlotStyling(slot)}
                  onClick={() => handleSlotSelect(slot.datetime)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {formatTime(slot.datetime)}
                    </span>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center gap-1">
                      {conflictSlots.has(slot.datetime) && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {slot.isReserved && (
                        <Clock className="h-3 w-3" />
                      )}
                      {slot.viewerCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{slot.viewerCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Text */}
                  <div className="text-xs mt-1 opacity-75">
                    {conflictSlots.has(slot.datetime) && 'Conflict!'}
                    {!slot.available && !conflictSlots.has(slot.datetime) && 'Unavailable'}
                    {slot.available && !conflictSlots.has(slot.datetime) && slot.viewerCount > 3 && 'High Demand'}
                    {slot.available && !conflictSlots.has(slot.datetime) && slot.viewerCount <= 3 && 'Available'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-400 rounded" />
          <span>High Demand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-500 rounded animate-pulse" />
          <span>Conflict</span>
        </div>
      </div>
    </div>
  );
}

export default RealtimeCalendar;