'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Update interface to match Booking model structure
interface RonBooking {
  id: string;
  status: string;
  signerId: string;
  serviceId: string;
  locationType: string;
  createdAt: string;
  updatedAt: string;
  priceAtBooking: number;
  depositAmount?: number;
  notes?: string;
  service?: {
    name: string;
    description?: string;
  };
  NotarizationDocument?: Array<{
    id: string;
    originalFilename: string;
    uploadedAt: string;
    isSigned: boolean;
  }>;
}

export default function RONDashboard() {
  const { data: session, status } = useSession();
  const [ronBookings, setRonBookings] = useState<RonBooking[]>([]);
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<RonBooking | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchRonBookings();
    }
  }, [session]);

  const fetchRonBookings = async () => {
    try {
      // Fetch RON bookings (bookings with locationType = REMOTE_ONLINE_NOTARIZATION)
      const response = await fetch('/api/bookings?locationType=REMOTE_ONLINE_NOTARIZATION');
      if (response.ok) {
        const bookings = await response.json();
        setRonBookings(bookings);
      } else {
        console.error('Failed to fetch RON bookings');
      }
    } catch (error) {
      console.error('Error fetching RON bookings:', error);
    }
  };

  const createNewRONBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ron/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: 'New Remote Online Notarization session'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewlyCreatedBooking(data as RonBooking);
        // Refresh the bookings list
        await fetchRonBookings();
      } else {
        const errorData = await response.json();
        console.error('Failed to create RON booking:', errorData.error);
        alert(`Failed to create RON booking: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating RON booking:', error);
      alert('Error creating RON booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'REQUESTED': 'Requested',
      'AWAITING_CLIENT_ACTION': 'Awaiting Documents',
      'READY_FOR_SERVICE': 'Documents Uploaded',
      'CONFIRMED': 'Confirmed',
      'SCHEDULED': 'Scheduled',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED_BY_CLIENT': 'Cancelled by Client',
      'CANCELLED_BY_STAFF': 'Cancelled by Staff'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'REQUESTED': 'text-blue-600',
      'AWAITING_CLIENT_ACTION': 'text-yellow-600',
      'READY_FOR_SERVICE': 'text-green-600',
      'CONFIRMED': 'text-green-600',
      'SCHEDULED': 'text-purple-600',
      'IN_PROGRESS': 'text-orange-600',
      'COMPLETED': 'text-green-800',
      'CANCELLED_BY_CLIENT': 'text-red-600',
      'CANCELLED_BY_STAFF': 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to access the RON Dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Remote Online Notarization Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your remote notarization sessions</p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <a href="/ron/how-it-works" className="inline-flex items-center gap-2">
              📖 How RON Works
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Button 
          onClick={createNewRONBooking} 
          disabled={loading}
          className="mb-4"
        >
          {loading ? 'Creating...' : 'Create New RON Session'}
        </Button>

        {newlyCreatedBooking && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">New RON Session Created!</CardTitle>
              <CardDescription>
                Session ID: {newlyCreatedBooking.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700">
                Status: <span className={getStatusColor(newlyCreatedBooking.status)}>
                  {getStatusDisplay(newlyCreatedBooking.status)}
                </span>
              </p>
              <p className="text-sm text-green-700 mt-1">
                You can now upload documents for this session.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your RON Sessions</h2>
        
        {ronBookings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No RON sessions found. Create your first session above!</p>
            </CardContent>
          </Card>
        ) : (
          ronBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">RON Session {booking.id.slice(-8)}</CardTitle>
                    <CardDescription>
                      Created: {new Date(booking.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusDisplay(booking.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Service</p>
                    <p className="text-sm text-gray-600">{booking.Service?.name || 'Remote Online Notarization'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-gray-600">${booking.priceAtBooking}</p>
                  </div>
                  {booking.NotarizationDocument && booking.NotarizationDocument.length > 0 && (
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium mb-2">Documents ({booking.NotarizationDocument.length})</p>
                      <div className="space-y-1">
                        {booking.NotarizationDocument.map((doc) => (
                          <div key={doc.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{doc.originalFilename}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              doc.isSigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.isSigned ? 'Signed' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {booking.notes && (
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-gray-600">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
