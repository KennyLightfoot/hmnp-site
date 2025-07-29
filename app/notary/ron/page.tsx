'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Video, 
  Clock, 
  User, 
  FileText, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Calendar
} from 'lucide-react';
import { BookingStatus, LocationType } from '@prisma/client';

interface RONBooking {
  id: string;
  signerName: string;
  signerEmail: string;
  scheduledDateTime?: string;
  status: BookingStatus;
  service: {
    name: string;
    duration: number;
  };
  finalPrice: number;
  proofTransactionId?: string;
  proofAccessLink?: string;
  proofStatus?: string;
  notes?: string;
  createdAt: string;
}

export default function RONSessionPanel() {
  const [ronBookings, setRonBookings] = useState<RONBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchRONBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        locationType: LocationType.REMOTE_ONLINE_NOTARIZATION,
        status: statusFilter,
      });

      const response = await fetch(`/api/notary/ron-bookings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch RON bookings');
      }

      const data = await response.json();
      setRonBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RON bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRONBookings();
  }, [statusFilter]);

  const getStatusColor = (status: BookingStatus) => {
    const colorMap: Partial<Record<BookingStatus, string>> = {
      [BookingStatus.PAYMENT_PENDING]: 'bg-red-100 text-red-800',
      [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800',
      [BookingStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
      [BookingStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
      [BookingStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
      [BookingStatus.READY_FOR_SERVICE]: 'bg-green-100 text-green-800',
      [BookingStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
      [BookingStatus.AWAITING_CLIENT_ACTION]: 'bg-yellow-100 text-yellow-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getProofStatusColor = (proofStatus?: string) => {
    if (!proofStatus) return 'bg-gray-100 text-gray-600';
    
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-blue-100 text-blue-800',
      'received': 'bg-purple-100 text-purple-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800',
    };
    return colorMap[proofStatus] || 'bg-gray-100 text-gray-600';
  };

  const handleStartSession = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/notary/start-ron-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start RON session');
      }

      // Refresh bookings
      fetchRONBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start RON session');
    }
  };

  const handleCompleteSession = async (bookingId: string, completionNotes?: string) => {
    try {
      const response = await fetch(`/api/notary/complete-ron-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, completionNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete RON session');
      }

      // Refresh bookings
      fetchRONBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete RON session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading RON sessions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] flex items-center">
            <Video className="h-6 w-6 mr-2" />
            RON Session Panel
          </h2>
          <p className="text-gray-600 mt-1">
            Manage remote online notarization sessions with Proof.co integration
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="READY_FOR_SERVICE">Ready</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchRONBookings} variant="outline" size="sm">
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

      <div className="grid gap-4">
        {ronBookings.length > 0 ? (
          ronBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Video className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.signerName}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-1" />
                        {booking.signerEmail}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace(/_/g, ' ')}
                    </Badge>
                    {booking.proofStatus && (
                      <Badge 
                        className={`ml-2 ${getProofStatusColor(booking.proofStatus)}`}
                      >
                        Proof: {booking.proofStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    {booking.Service.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {booking.Service.duration} minutes
                  </div>
                  {booking.scheduledDateTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(booking.scheduledDateTime).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    Price: <span className="font-semibold text-gray-900">${booking.finalPrice}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {booking.proofAccessLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(booking.proofAccessLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View in Proof
                      </Button>
                    )}
                    
                    {booking.status === BookingStatus.READY_FOR_SERVICE && (
                      <Button
                        onClick={() => handleStartSession(booking.id)}
                        size="sm"
                        className="bg-[#A52A2A] hover:bg-[#8B0000]"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Session
                      </Button>
                    )}
                    
                    {booking.status === BookingStatus.IN_PROGRESS && (
                      <Button
                        onClick={() => handleCompleteSession(booking.id, 'Session completed successfully')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Quick Complete
                      </Button>
                    )}
                    
                    {booking.status === BookingStatus.COMPLETED && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No RON Sessions Found
              </h3>
              <p className="text-gray-600">
                Remote online notarization sessions will appear here when scheduled.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 