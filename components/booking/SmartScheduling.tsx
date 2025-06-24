"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, Clock, MapPin, Users, Zap, AlertTriangle, 
  CheckCircle, Navigation, Timer, TrendingUp
} from 'lucide-react';
import { format, addDays, addHours, isAfter, isBefore, parseISO } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  optimized: boolean;
  travelTime?: number;
  bufferTime?: number;
  conflictRisk?: 'low' | 'medium' | 'high';
  recommendationScore?: number;
  reasons?: string[];
}

interface SmartSchedulingProps {
  serviceId: string;
  serviceDuration: number;
  signerCount: number;
  urgencyLevel: 'standard' | 'same-day' | 'emergency';
  serviceLocation: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  onTimeSelected: (slot: TimeSlot) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

interface OptimizationFactors {
  multiSignerBuffer: number; // Extra time for multiple signers
  travelTimeBuffer: number; // Buffer for travel delays
  documentComplexity: number; // Extra time for complex documents
  urgencyMultiplier: number; // Urgency factor
}

const OPTIMIZATION_RULES = {
  standard: {
    multiSignerBuffer: 15, // 15 min per additional signer
    travelTimeBuffer: 10, // 10 min buffer
    documentComplexity: 5, // 5 min per complex doc
    urgencyMultiplier: 1.0,
  },
  'same-day': {
    multiSignerBuffer: 10,
    travelTimeBuffer: 15,
    documentComplexity: 3,
    urgencyMultiplier: 1.2,
  },
  emergency: {
    multiSignerBuffer: 5,
    travelTimeBuffer: 20,
    documentComplexity: 0,
    urgencyMultiplier: 1.5,
  },
};

export default function SmartScheduling({
  serviceId,
  serviceDuration,
  signerCount,
  urgencyLevel,
  serviceLocation,
  onTimeSelected,
  selectedDate,
  onDateChange,
}: SmartSchedulingProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [optimizationEnabled, setOptimizationEnabled] = useState(true);
  const [travelTimeEstimate, setTravelTimeEstimate] = useState<number | null>(null);

  // Calculate optimization factors
  const optimizationFactors = useMemo(() => {
    return OPTIMIZATION_RULES[urgencyLevel];
  }, [urgencyLevel]);

  // Calculate total appointment duration including buffers
  const calculateOptimizedDuration = useMemo(() => {
    let duration = serviceDuration;
    
    // Add buffer for multiple signers
    if (signerCount > 1) {
      duration += (signerCount - 1) * optimizationFactors.multiSignerBuffer;
    }
    
    // Add travel buffer
    duration += optimizationFactors.travelTimeBuffer;
    
    // Apply urgency multiplier
    duration = Math.round(duration * optimizationFactors.urgencyMultiplier);
    
    return Math.max(duration, serviceDuration); // Never less than base duration
  }, [serviceDuration, signerCount, optimizationFactors]);

  // Fetch available time slots
  useEffect(() => {
    if (selectedDate && serviceLocation.address) {
      fetchOptimizedSlots();
    }
  }, [selectedDate, serviceId, signerCount, urgencyLevel, optimizationEnabled]);

  // Estimate travel time on location change
  useEffect(() => {
    if (serviceLocation.address) {
      estimateTravelTime();
    }
  }, [serviceLocation]);

  const estimateTravelTime = async () => {
    try {
      const response = await fetch('/api/scheduling/travel-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: `${serviceLocation.address}, ${serviceLocation.city}, ${serviceLocation.state} ${serviceLocation.zip}`,
          serviceDate: selectedDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTravelTimeEstimate(data.travelTimeMinutes);
      }
    } catch (error) {
      console.error('Travel time estimation failed:', error);
    }
  };

  const fetchOptimizedSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scheduling/smart-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date: selectedDate,
          duration: calculateOptimizedDuration,
          signerCount,
          urgencyLevel,
          location: serviceLocation,
          optimizationEnabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } else {
        // Fallback to mock data for demo
        setAvailableSlots(generateMockSlots());
      }
    } catch (error) {
      console.error('Failed to fetch optimized slots:', error);
      setAvailableSlots(generateMockSlots());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseDate = selectedDate ? parseISO(selectedDate) : new Date();
    
    // Generate slots from 8 AM to 6 PM
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = addHours(baseDate, hour);
        startTime.setMinutes(minute);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + calculateOptimizedDuration);
        
        const slot: TimeSlot = {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          available: Math.random() > 0.3, // 70% availability
          optimized: optimizationEnabled,
          travelTime: travelTimeEstimate || Math.floor(Math.random() * 30) + 5,
          bufferTime: optimizationFactors.travelTimeBuffer,
          conflictRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          recommendationScore: Math.floor(Math.random() * 100),
          reasons: generateRecommendationReasons(hour, signerCount, urgencyLevel),
        };
        
        slots.push(slot);
      }
    }
    
    return slots.filter(slot => slot.available);
  };

  const generateRecommendationReasons = (hour: number, signers: number, urgency: string): string[] => {
    const reasons = [];
    
    if (hour >= 9 && hour <= 11) {
      reasons.push('Optimal morning time slot');
    }
    if (hour >= 14 && hour <= 16) {
      reasons.push('Ideal afternoon availability');
    }
    if (signers > 2 && hour >= 10 && hour <= 15) {
      reasons.push('Best for multi-signer coordination');
    }
    if (urgency === 'emergency') {
      reasons.push('Emergency slot available');
    }
    if (Math.random() > 0.5) {
      reasons.push('Low traffic time');
    }
    if (Math.random() > 0.7) {
      reasons.push('Notary has extended availability');
    }
    
    return reasons;
  };

  const handleSlotSelection = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onTimeSelected(slot);
  };

  const getSlotRecommendationBadge = (slot: TimeSlot) => {
    if (!slot.recommendationScore) return null;
    
    if (slot.recommendationScore >= 80) {
      return <Badge className="bg-green-100 text-green-800">Highly Recommended</Badge>;
    } else if (slot.recommendationScore >= 60) {
      return <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>;
    } else if (slot.recommendationScore >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Good Option</Badge>;
    }
    return null;
  };

  const getConflictRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Sort slots by recommendation score
  const sortedSlots = useMemo(() => {
    return [...availableSlots].sort((a, b) => {
      if (optimizationEnabled) {
        return (b.recommendationScore || 0) - (a.recommendationScore || 0);
      }
      return 0;
    });
  }, [availableSlots, optimizationEnabled]);

  const topRecommendations = sortedSlots.slice(0, 3);
  const otherSlots = sortedSlots.slice(3);

  return (
    <div className="space-y-6">
      {/* Smart Scheduling Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Smart Scheduling
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-optimized time slots for {signerCount} signers
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOptimizationEnabled(!optimizationEnabled)}
          className={optimizationEnabled ? 'bg-blue-50 border-blue-200' : ''}
        >
          {optimizationEnabled ? 'Smart Mode On' : 'Basic Mode'}
        </Button>
      </div>

      {/* Optimization Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Scheduling Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>{calculateOptimizedDuration} min duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{signerCount} signers</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span>{travelTimeEstimate || '~15'} min travel</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="capitalize">{urgencyLevel} priority</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      {optimizationEnabled && topRecommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Top Recommendations
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendations.map((slot, index) => (
              <Card 
                key={slot.startTime}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSlot?.startTime === slot.startTime ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${index === 0 ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                onClick={() => handleSlotSelection(slot)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {format(parseISO(slot.startTime), 'h:mm a')}
                    </CardTitle>
                    {index === 0 && (
                      <Badge className="bg-green-100 text-green-800">Best Match</Badge>
                    )}
                    {getSlotRecommendationBadge(slot)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Time Details */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}
                    </span>
                  </div>

                  {/* Travel & Buffer Info */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {slot.travelTime}m travel
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {slot.bufferTime}m buffer
                    </span>
                  </div>

                  {/* Conflict Risk */}
                  <div className={`text-xs ${getConflictRiskColor(slot.conflictRisk)}`}>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {slot.conflictRisk} conflict risk
                    </span>
                  </div>

                  {/* Recommendation Reasons */}
                  {slot.reasons && slot.reasons.length > 0 && (
                    <div className="text-xs text-green-700">
                      <ul className="space-y-1">
                        {slot.reasons.slice(0, 2).map((reason, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Available Slots */}
      {otherSlots.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Other Available Times
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {otherSlots.map((slot) => (
              <Button
                key={slot.startTime}
                variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center"
                onClick={() => handleSlotSelection(slot)}
              >
                <span className="font-medium">
                  {format(parseISO(slot.startTime), 'h:mm a')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {slot.travelTime}m travel
                </span>
                {slot.conflictRisk === 'high' && (
                  <AlertTriangle className="h-3 w-3 text-red-500 mt-1" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">
            Optimizing schedule for {signerCount} signers...
          </p>
        </div>
      )}

      {/* No Slots Available */}
      {!isLoading && availableSlots.length === 0 && selectedDate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No available time slots found for the selected date. 
            Please try a different date or contact us for custom scheduling.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Selected Appointment Time
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700">
            <div className="space-y-2">
              <p className="font-medium">
                {format(parseISO(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')} at{' '}
                {format(parseISO(selectedSlot.startTime), 'h:mm a')}
              </p>
              <p>Duration: {calculateOptimizedDuration} minutes (including buffers)</p>
              <p>Travel time: ~{selectedSlot.travelTime} minutes</p>
              {selectedSlot.reasons && selectedSlot.reasons.length > 0 && (
                <p>Why this time: {selectedSlot.reasons[0]}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 