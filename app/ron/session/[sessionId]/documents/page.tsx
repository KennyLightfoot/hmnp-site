'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Role } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface SessionDocument {
  id: string;
  originalFilename: string;
  s3Key: string;
  createdAt: string;
  isSigned: boolean;
  uploadedAt: string;
}

interface RonBooking {
  id: string;
  status: string;
  signerId: string;
  locationType: string;
  NotarizationDocument?: SessionDocument[];
}

export default function SessionDocumentsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ronBooking, setRonBooking] = useState<RonBooking | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch RON booking details and documents
  const fetchRonBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.booking && data.booking.locationType === 'REMOTE_ONLINE_NOTARIZATION') {
          setRonBooking(data.booking);
        } else {
          toast({
            title: 'Invalid Session',
            description: 'This is not a valid RON session.',
            variant: 'destructive',
          });
          router.push('/ron/dashboard');
        }
      } else {
        throw new Error('Failed to fetch session details');
      }
    } catch (error) {
      console.error('Error fetching RON booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (authStatus === 'authenticated' && session?.user?.role !== Role.SIGNER) {
      toast({
        title: 'Access Denied',
        description: 'This page is for signers only.',
        variant: 'destructive',
      });
      router.push('/ron/dashboard');
      return;
    }
    if (sessionId && authStatus === 'authenticated') {
      fetchRonBooking();
    }
  }, [authStatus, session, router, toast, sessionId]);

  // Early returns for loading and missing sessionId
  if (authStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Loading session information...</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-4">Session ID Missing</h1>
        <p className="mb-6 text-center">
          The session identifier is missing from the URL.
          Please return to the dashboard or check the link.
        </p>
        <Button onClick={() => router.push('/ron/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  if (authStatus !== 'authenticated' || session?.user?.role !== Role.SIGNER) {
    return <p>Access Denied or Redirecting...</p>;
  }

  if (!ronBooking) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">RON session not found or loading...</p>
        <Button onClick={() => router.push('/ron/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'No file selected', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Initiate Upload
      setUploadProgress(10);
      const initiateRes = await fetch(`/api/ron/sessions/${sessionId}/documents/initiate-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filename: selectedFile.name, 
          fileSize: selectedFile.size,
          contentType: selectedFile.type 
        }),
      });
      
      setUploadProgress(30);
      const initiateData = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(initiateData.error || 'Failed to initiate upload.');
      }

      const { documentId, s3Key, uploadUrl } = initiateData;
      setUploadProgress(50);

      // Step 2: Simulate file upload (in a real implementation, you'd upload to S3 here)
      // For now, we'll just simulate the upload process
      toast({ title: 'Processing Upload...', description: `Processing ${selectedFile.name}` });
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(80);

      // Step 3: Confirm Upload with Backend
      const confirmRes = await fetch(`/api/ron/sessions/${sessionId}/documents/${documentId}/confirm-upload`, {
        method: 'POST',
      });
      setUploadProgress(100);
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        throw new Error(confirmData.error || 'Failed to confirm upload.');
      }

      toast({
        title: 'Upload Successful!',
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
      
      // Refresh the booking data to show the new document
      await fetchRonBooking();
      setSelectedFile(null);

    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
    };
    return statusMap[status] || status;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Upload Documents for RON Session</h1>
        <p className="text-sm text-gray-600 mb-2">Session ID: {sessionId}</p>
        <p className="text-sm">
          Status: <span className="font-medium">{getStatusDisplay(ronBooking.status)}</span>
        </p>
      </div>

      <div className="mb-6 p-4 border rounded-lg">
        <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
          Select Document to Upload:
        </label>
        <Input 
          id="file-upload" 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading} 
          className="mb-2"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
        />
        {selectedFile && (
          <p className="text-sm text-gray-500 mb-2">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !selectedFile} 
          className="mt-2"
        >
          {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload Document'}
        </Button>
        {isUploading && (
          <div className="mt-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-1">Uploading {selectedFile?.name}...</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Uploaded Documents</h2>
        {!ronBooking.NotarizationDocument || ronBooking.NotarizationDocument.length === 0 ? (
          <p className="text-gray-500">No documents uploaded for this session yet.</p>
        ) : (
          <div className="space-y-2">
            {ronBooking.NotarizationDocument.map(doc => (
              <div 
                key={doc.id} 
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium">{doc.originalFilename}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  doc.isSigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.isSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => router.push('/ron/dashboard')}
        >
          Back to Dashboard
        </Button>
        {ronBooking.NotarizationDocument && ronBooking.NotarizationDocument.length > 0 && (
          <Button 
            disabled={ronBooking.status !== 'READY_FOR_SERVICE'}
            onClick={() => {
              toast({
                title: 'Session Ready',
                description: 'Your documents are uploaded and the session is ready to begin.',
              });
            }}
          >
            Session Ready
          </Button>
        )}
      </div>
    </div>
  );
}
