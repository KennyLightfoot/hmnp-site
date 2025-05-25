'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Role } from '@prisma/client'; // Make sure this import path is correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress'; // For visual feedback

interface SessionDocument {
  id: string;
  originalFilename: string;
  s3Key: string;
  createdAt: string;
  // Add other relevant fields, e.g., a status for the document itself
}

export default function SessionDocumentsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Loading session information...</p>
        {/* You can add a spinner component here if you have one */}
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
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Percentage
  const [sessionDocuments, setSessionDocuments] = useState<SessionDocument[]>([]);
  // TODO: Fetch existing documents for this session on page load

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (authStatus === 'authenticated' && (session?.user as any)?.role !== Role.SIGNER) {
      toast({
        title: 'Access Denied',
        description: 'This page is for signers only.',
        variant: 'destructive',
      });
      router.push('/ron/dashboard');
      return;
    }
    // TODO: Add a check to verify if the current signer owns this session.
    // This could involve fetching session details and comparing session.signerId with currentUser.id
    // For now, API endpoints will do the primary authorization.
  }, [authStatus, session, router, toast, sessionId]);

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
    if (!sessionId) {
      toast({ title: 'Error', description: 'Session ID is missing.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Initiate Upload - Get Presigned URL
      setUploadProgress(10); // Initial progress
      const initiateRes = await fetch(`/api/ron/sessions/${sessionId}/documents/initiate-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFile.name, contentType: selectedFile.type }),
      });
      
      setUploadProgress(30);
      const initiateData = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(initiateData.error || 'Failed to initiate upload.');
      }

      const { presignedUrl, documentId, s3Key } = initiateData;
      toast({ title: 'Upload Initiated', description: `Preparing to upload ${selectedFile.name}. Document ID: ${documentId}` });
      setUploadProgress(50);

      // Step 2: Upload to S3
      toast({ title: 'Uploading to S3...', description: `Sending ${selectedFile.name} to secure storage.` });
      const s3UploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!s3UploadRes.ok) {
        // Attempt to get error details from S3 response if possible (often XML)
        const s3ErrorText = await s3UploadRes.text(); 
        console.error('S3 Upload Error Response:', s3ErrorText);
        throw new Error(`Failed to upload file to S3. Status: ${s3UploadRes.status}. ${s3ErrorText.substring(0,100)}`);
      }
      setUploadProgress(80);
      toast({ title: 'File Uploaded to S3', description: `${selectedFile.name} successfully stored.` });

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
        description: `${selectedFile.name} has been uploaded and confirmed.`,
        variant: 'default',
      });
      
      // Add the new document to the list (or refetch)
      setSessionDocuments(prevDocs => [...prevDocs, { 
        id: documentId, 
        originalFilename: selectedFile.name, 
        s3Key, 
        createdAt: new Date().toISOString()
      }]);
      setSelectedFile(null); // Clear file input

    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (authStatus === 'loading') {
    return <p>Loading document upload page...</p>;
  }

  if (authStatus !== 'authenticated' || (session?.user as any)?.role !== Role.SIGNER) {
    return <p>Access Denied or Redirecting...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Upload Documents for Session</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Session ID: {sessionId}</p>

      <div className="mb-6 p-4 border rounded-lg">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Document:</label>
        <Input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} className="mb-2" />
        {selectedFile && <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>}
        <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="mt-2">
          {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload Selected Document'}
        </Button>
        {isUploading && <Progress value={uploadProgress} className="w-full mt-2" />}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Uploaded Documents</h2>
        {sessionDocuments.length === 0 ? (
          <p className="text-gray-500">No documents uploaded for this session yet.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {sessionDocuments.map(doc => (
              <li key={doc.id} className="text-sm">
                {doc.originalFilename} (Uploaded: {new Date(doc.createdAt).toLocaleTimeString()})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
