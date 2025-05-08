'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchAssignmentsAction, AssignmentData } from '@/app/portal/_actions/assignments'; // Adjust path if your actions are elsewhere
import PortalAssignmentsView from '@/components/portal-assignments-view';
import { Skeleton } from '@/components/ui/skeleton'; // For a loading state

interface PageAwareDataLoaderProps {
  userId: string;
  userRole: string;
  pageSize: number;
}

export default function PageAwareDataLoader({ userId, userRole, pageSize }: PageAwareDataLoaderProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{ assignments: AssignmentData[]; totalAssignments: number; error?: string } | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || undefined; // Pass undefined if empty for cleaner action params
  const currentStatus = searchParams.get('status') || undefined; // Pass undefined if empty

  useEffect(() => {
    startTransition(async () => {
      const result = await fetchAssignmentsAction({
        page: currentPage,
        pageSize,
        search: currentSearch,
        status: currentStatus,
        userId,
        userRole,
      });
      setData(result);
    });
  }, [currentPage, currentSearch, currentStatus, pageSize, userId, userRole]);

  if (!data || isPending) {
    // Basic loading state, you can make this more sophisticated
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-1/4" />
        <div className="border rounded-lg mt-4 p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (data.error) {
    return <p className="text-red-500">{data.error}</p>;
  }

  return (
    <PortalAssignmentsView
      assignments={data.assignments}
      totalAssignments={data.totalAssignments}
      currentPage={currentPage} // Pass the currentPage derived from useSearchParams
      pageSize={pageSize}
      currentSearch={currentSearch || ''} // PortalAssignmentsView expects string
      currentStatus={currentStatus || ''} // PortalAssignmentsView expects string
    />
  );
} 