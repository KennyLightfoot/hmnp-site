'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  ExternalLink, 
  Navigation, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Car
} from 'lucide-react';
import { LocationType, BookingStatus } from '@prisma/client';

interface MobileBooking {
  id: string;
  signerName: string;
  signerEmail: string;
  signerPhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  scheduledDateTime?: string;
  status: BookingStatus;
  service: {
    name: string;
    duration: number;
  };
  finalPrice: number;
  notes?: string;
  mileageMiles?: number;
  estimatedCompletionTime?: string;
  notaryTravelTimeMinutes?: number;
  locationNotes?: string;
}

export default function MobileRouteBoard() {
  const [bookings, setBookings] = useState<MobileBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  const fetchMobileBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        locationType: LocationType.CLIENT_SPECIFIED_ADDRESS,
        status: statusFilter,
        date: dateFilter,
      });

      const response = await fetch(`/api/notary/mobile-bookings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mobile bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileBookings();
  }, [statusFilter, dateFilter]);

  const getStatusColor = (status: BookingStatus) => {
    const colorMap: Partial<Record<BookingStatus, string>> = {
      [BookingStatus.PAYMENT_PENDING]: 'bg-red-100 text-red-800',
      [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800',
      [BookingStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [BookingStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
      [BookingStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
      [BookingStatus.CANCELLED_BY_CLIENT]: 'bg-red-100 text-red-800',
      [BookingStatus.CANCELLED_BY_STAFF]: 'bg-red-100 text-red-800',
      [BookingStatus.NO_SHOW]: 'bg-yellow-100 text-yellow-800',
      [BookingStatus.AWAITING_CLIENT_ACTION]: 'bg-blue-100 text-blue-800',
      [BookingStatus.READY_FOR_SERVICE]: 'bg-green-100 text-green-800',
      [BookingStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
      [BookingStatus.REQUIRES_RESCHEDULE]: 'bg-yellow-100 text-yellow-800',
      [BookingStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getGoogleMapsUrl = (booking: MobileBooking) => {
    if (!booking.addressStreet) return '';
    
    const address = [
      booking.addressStreet,
      booking.addressCity,
      booking.addressState,
      booking.addressZip
    ].filter(Boolean).join(', ');
    
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/notary/complete-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete booking');
      }

      // Refresh bookings
      fetchMobileBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
    }
  };

  const handleMarkInProgress = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/notary/update-booking-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bookingId, 
          status: BookingStatus.IN_PROGRESS 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings
      fetchMobileBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading mobile bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] flex items-center">
            <Car className="h-6 w-6 mr-2" />
            Mobile Route Board
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your mobile notary appointments and route planning
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="READY_FOR_SERVICE">Ready</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchMobileBookings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Mobile Route Board Ready
          </h3>
          <p className="text-gray-600">
            Mobile bookings will appear here when scheduled. API endpoint is connected and ready for testing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 