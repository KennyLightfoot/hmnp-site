'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from '@prisma/client'; // Assuming Role enum is available
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { useToast } from '@/components/ui/use-toast'; // Assuming you have a Toast component

// Define a type for the session object for clarity
interface NotarizationSession {
  id: string;
  status: string;
  createdAt: string;
  // Add other fields as needed from your API response
}

export default function SignerDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newlyCreatedSession, setNewlyCreatedSession] = useState<NotarizationSession | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
    // Also check role if session is available
    if (authStatus === 'authenticated' && (session?.user as any)?.role !== Role.SIGNER) {
      // Redirect to a generic home page or an unauthorized page if not a SIGNER
      toast({
        title: 'Access Denied',
        description: 'This page is for signers only.',
        variant: 'destructive',
      });
      router.push('/'); 
    }
  }, [authStatus, session, router, toast]);

  const handleStartNewSession = async () => {
    setIsLoading(true);
    setNewlyCreatedSession(null);
    try {
      const res = await fetch('/api/ron/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start new session');
      }

      setNewlyCreatedSession(data as NotarizationSession);
      toast({
        title: 'Session Created',
        description: `New notarization session ID: ${data.id} created successfully.`,
      });
      // Optionally, redirect to a page to manage this specific session, e.g., document upload
      // router.push(`/ron/session/${data.id}`); 

    } catch (err: any) {
      console.error('Error starting new session:', err);
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return <p>Loading dashboard...</p>;
  }

  // Ensure session is loaded and user is a SIGNER before rendering content
  if (authStatus === 'authenticated' && (session?.user as any)?.role === Role.SIGNER) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Signer Dashboard</h1>
        
        <div className="mb-8">
          <Button onClick={handleStartNewSession} disabled={isLoading}>
            {isLoading ? 'Starting Session...' : 'Start New Notarization Session'}
          </Button>
        </div>

        {newlyCreatedSession && (
          <div className="mt-6 p-4 border rounded-md bg-green-50 dark:bg-green-900/20">
            <h2 className="text-xl font-semibold">New Session Details:</h2>
            <p>Session ID: {newlyCreatedSession.id}</p>
            <p>Status: {newlyCreatedSession.status}</p>
            <p>Created At: {new Date(newlyCreatedSession.createdAt).toLocaleString()}</p>
            {/* Next step could be a link/button to upload documents for this session */}
            {/* <Button onClick={() => router.push(`/ron/session/${newlyCreatedSession.id}/documents`)} className="mt-2">Upload Documents</Button> */}
          </div>
        )}
        
        {/* Placeholder for listing existing sessions */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Your Notarization Sessions</h2>
          <p className="text-gray-500">Existing sessions will be listed here.</p>
          {/* TODO: Fetch and display list of user's sessions */}
        </div>
      </div>
    );
  }

  // Fallback for users who are authenticated but not SIGNERS (already handled by redirect, but good practice)
  // Or if authStatus is 'unauthenticated' and redirect hasn't happened yet.
  return <p>Access Denied or Redirecting...</p>; 
}
