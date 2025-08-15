'use client';

/**
 * Enhanced Time Slot Display Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - Urgency indicators for same-day/next-day slots
 * - Demand tracking with visual indicators
 * - Popular time highlighting
 * - Recommended slot suggestions
 * - Mobile-optimized grid layout
 * - Accessibility features
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Zap, 
  Flame, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EnhancedTimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  duration: number;
  displayTime: string;
  timeString: string;
  popular: boolean;
  urgent: boolean;
  demand: 'low' | 'medium' | 'high';
  bookingCount: number;
  remainingCapacity: number;
  recommended: boolean;
  sameDay: boolean;
  nextDay: boolean;
}

interface EnhancedTimeSlotDisplayProps {
  slots: EnhancedTimeSlot[];
  selectedSlot?: EnhancedTimeSlot;
  onSlotSelect: (slot: EnhancedTimeSlot) => void;
  isLoading?: boolean;
  error?: string | null;
  showDemand?: boolean;
  showUrgency?: boolean;
  showPopular?: boolean;
  showRecommended?: boolean;
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
  maxSlots?: number;
  serviceType?: string;
}

export default function EnhancedTimeSlotDisplay({
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading = false,
  error = null,
  showDemand = true,
  showUrgency = true,
  showPopular = true,
  showRecommended = true,
  variant = 'grid',
  className = '',
  maxSlots = 20,
  serviceType
}: EnhancedTimeSlotDisplayProps) {
  const [filteredSlots, setFilteredSlots] = useState<EnhancedTimeSlot[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['all']));

  // Filter and sort slots based on active filters
  useEffect(() => {
    let filtered = [...slots];

    // Apply filters
    if (!activeFilters.has('all')) {
      if (activeFilters.has('same-day')) {
        filtered = filtered.filter(slot => slot.sameDay);
      }
      if (activeFilters.has('next-day')) {
        filtered = filtered.filter(slot => slot.nextDay);
      }
      if (activeFilters.has('popular')) {
        filtered = filtered.filter(slot => slot.popular);
      }
      if (activeFilters.has('recommended')) {
        filtered = filtered.filter(slot => slot.recommended);
      }
      if (activeFilters.has('urgent')) {
        filtered = filtered.filter(slot => slot.urgent);
      }
    }

    // Limit number of slots
    filtered = filtered.slice(0, maxSlots);
    setFilteredSlots(filtered);
  }, [slots, activeFilters, maxSlots]);

  // Get demand color and styling
  const getDemandStyling = (demand: string) => {
    switch (demand) {
      case 'high':
        return {
          bg: 'bg-red-50 border-red-200 hover:bg-red-100',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'medium':
        return {
          bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'low':
        return {
          bg: 'bg-green-50 border-green-200 hover:bg-green-100',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  // Get urgency styling
  const getUrgencyStyling = (slot: EnhancedTimeSlot) => {
    if (slot.urgent) {
      return 'ring-2 ring-red-300 animate-pulse';
    }
    if (slot.sameDay) {
      return 'ring-2 ring-orange-300';
    }
    if (slot.nextDay) {
      return 'ring-2 ring-blue-300';
    }
    return '';
  };

  // Handle filter toggle
  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (filter === 'all') {
      newFilters.clear();
      newFilters.add('all');
    } else {
      newFilters.delete('all');
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
        if (newFilters.size === 0) {
          newFilters.add('all');
        }
      } else {
        newFilters.add(filter);
      }
    }
    setActiveFilters(newFilters);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // No slots available
  if (slots.length === 0) {
    return (
      <Card className={cn('border-orange-200 bg-orange-50', className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto" />
            <h3 className="font-medium text-orange-800">No Available Times</h3>
            <p className="text-sm text-orange-700">
              No time slots are available for this date. Please try a different date or contact us directly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Controls */}
      {slots.length > 4 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeFilters.has('all') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('all')}
            className="text-xs"
          >
            All Times ({slots.length})
          </Button>
          
          {showUrgency && (
            <>
              <Button
                type="button"
                variant={activeFilters.has('same-day') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('same-day')}
                className="text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Same Day ({slots.filter(s => s.sameDay).length})
              </Button>
              <Button
                type="button"
                variant={activeFilters.has('next-day') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('next-day')}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Next Day ({slots.filter(s => s.nextDay).length})
              </Button>
            </>
          )}
          
          {showPopular && (
            <Button
              type="button"
              variant={activeFilters.has('popular') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('popular')}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Popular ({slots.filter(s => s.popular).length})
            </Button>
          )}
          
          {showRecommended && (
            <Button
              type="button"
              variant={activeFilters.has('recommended') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('recommended')}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              Recommended ({slots.filter(s => s.recommended).length})
            </Button>
          )}
        </div>
      )}

      {/* Time Slots Grid */}
      <div className={cn(
        'grid gap-3',
        variant === 'grid' && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        variant === 'list' && 'grid-cols-1',
        variant === 'compact' && 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      )}>
        {filteredSlots.map((slot, index) => {
          const demandStyling = getDemandStyling(slot.demand);
          const urgencyStyling = getUrgencyStyling(slot);
          const isSelected = selectedSlot?.startTime === slot.startTime;
          
          return (
            <Button
              key={`${slot.startTime}-${index}`}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'h-auto p-3 flex flex-col items-center justify-center text-center transition-all duration-200 relative',
                !isSelected && demandStyling.bg,
                !isSelected && demandStyling.text,
                urgencyStyling,
                isSelected && 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
              )}
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.available}
            >
              {/* Time Display */}
              <div className="font-semibold text-lg mb-1">
                {slot.displayTime}
              </div>
              
              {/* Duration */}
              <div className="text-xs opacity-75 mb-2">
                {slot.duration} min
              </div>
              
              {/* Indicators */}
              <div className="flex flex-wrap gap-1 justify-center">
                {/* Same Day */}
                {slot.sameDay && (
                  <Badge variant="destructive" className="text-xs">
                    <Zap className="h-2 w-2 mr-1" />
                    Today
                  </Badge>
                )}
                
                {/* Next Day */}
                {slot.nextDay && !slot.sameDay && (
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="h-2 w-2 mr-1" />
                    Tomorrow
                  </Badge>
                )}
                
                {/* Popular */}
                {slot.popular && showPopular && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-2 w-2 mr-1" />
                    Popular
                  </Badge>
                )}
                
                {/* Recommended */}
                {slot.recommended && showRecommended && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-2 w-2 mr-1" />
                    Best
                  </Badge>
                )}
                
                {/* Demand Level */}
                {showDemand && slot.demand !== 'low' && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', demandStyling.badge)}
                  >
                    <Users className="h-2 w-2 mr-1" />
                    {slot.demand === 'high' ? 'Busy' : 'Moderate'}
                  </Badge>
                )}
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Summary Information */}
      {filteredSlots.length > 0 && (
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>
              Showing {filteredSlots.length} of {slots.length} available times
            </span>
          </div>
          
          {/* Demand Legend */}
          {showDemand && (
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                Low demand
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                Moderate demand
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                High demand
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 