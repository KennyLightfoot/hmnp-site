"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Home,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { pwaManager, OfflineBooking } from '@/lib/pwa/service-worker';

export default function OfflineConfirmationPage() {
  const router = useRouter();
  const [offlineBookings, setOfflineBookings] = useState<OfflineBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : false);

  useEffect(() => {
    loadOfflineBookings();
    
    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      setTimeout(() => {
        handleSyncBookings();
      }, 1000);
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineBookings = async () => {
    try {
      setLoading(true);
      const bookings = await pwaManager.getOfflineBookings();
      setOfflineBookings(bookings);
    } catch (error) {
      console.error('Failed to load offline bookings:', error);
      toast({
        title: 'Error Loading Bookings',
        description: 'Failed to load offline bookings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBookings = async () => {
    if (!isOnline) {
      toast({
        title: 'No Internet Connection',
        description: 'Please connect to the internet to sync your bookings.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSyncing(true);
      const result = await pwaManager.syncOfflineBookings();
      
      if (result.success) {
        toast({
          title: 'Bookings Synced!',
          description: `${result.synced} of ${result.total} bookings submitted successfully.`,
        });
        
        // Reload the bookings list
        await loadOfflineBookings();
        
        // If all bookings are synced, redirect to dashboard
        if (result.synced === result.total && result.total > 0) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync offline bookings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_sync':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Sync</Badge>;
      case 'synced':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Synced</Badge>;
      case 'sync_failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Sync Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading offline bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isOnline ? (
              <Wifi className="h-8 w-8 text-green-600" />
            ) : (
              <WifiOff className="h-8 w-8 text-orange-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">Offline Bookings</h1>
          </div>
          <p className="text-lg text-gray-600">
            {isOnline 
              ? 'Your device is online. Bookings can be synced now.' 
              : 'Your bookings are saved offline and will sync when you reconnect.'
            }
          </p>
        </div>

        {/* Connection Status */}
        <Alert className={`mb-6 ${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 inline mr-2" />
                  Connected to internet
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 inline mr-2" />
                  No internet connection
                </>
              )}
            </span>
            
            {isOnline && offlineBookings.some(b => b.status === 'pending_sync') && (
              <Button 
                size="sm" 
                onClick={handleSyncBookings}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Now'
                )}
              </Button>
            )}
          </AlertDescription>
        </Alert>

        {/* Offline Bookings List */}
        {offlineBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Offline Bookings</h3>
              <p className="text-gray-600 mb-4">All your bookings have been successfully submitted.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/booking/enhanced')}>
                  Create New Booking
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offlineBookings.map((booking) => (
              <Card key={booking.id || booking.offlineId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {booking.serviceId?.includes('standard') && 'Standard Notary'}
                      {booking.serviceId?.includes('extended') && 'Extended Hours Notary'}
                      {booking.serviceId?.includes('loan') && 'Loan Signing Specialist'}
                      {!booking.serviceId?.includes('standard') && 
                       !booking.serviceId?.includes('extended') && 
                       !booking.serviceId?.includes('loan') && 'Notary Service'}
                    </CardTitle>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
                      <p><strong>Email:</strong> {booking.email}</p>
                      <p><strong>Phone:</strong> {booking.phone}</p>
                      <p><strong>Signers:</strong> {booking.numberOfSigners}</p>
                      <p><strong>Documents:</strong> {booking.numberOfDocuments}</p>
                    </div>
                    <div>
                      <p><strong>Date:</strong> {formatDateTime(booking.appointmentStartTime)}</p>
                      <p><strong>Location:</strong> {booking.addressStreet}, {booking.addressCity}, {booking.addressState} {booking.addressZip}</p>
                      <p><strong>Stored:</strong> {formatDateTime(booking.timestamp)}</p>
                      {booking.pricingBreakdown?.total && (
                        <p><strong>Total:</strong> ${booking.pricingBreakdown.total.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={() => router.push('/booking/enhanced')}>
                Create Another Booking
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={loadOfflineBookings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}