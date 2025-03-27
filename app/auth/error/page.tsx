'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p>There was an error connecting your GoHighLevel account.</p>
        <p>Please try again or contact support if the issue persists.</p>
      </div>
    </div>
  );
} 