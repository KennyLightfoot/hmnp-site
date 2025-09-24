import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Metadata } from "next";
import { Suspense } from 'react';
import PageAwareDataLoader from '@/components/page-aware-data-loader';

export const dynamic = 'force-dynamic'; // Explicitly set route to dynamic

export const metadata: Metadata = {
  title: "HMNP Portal",
};

// Define the props for the page, including searchParams
interface PortalAssignmentsPageProps {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
    // other params if any
  }>;
}

const PAGE_SIZE = 15; // Define items per page

export default async function PortalAssignmentsPage({ searchParams }: PortalAssignmentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user;
  const userId = user.id as string;
  const userRole = user.role as string;

  if (!userId || !userRole) {
    console.error("User ID or Role missing from session:", session.user);
    redirect('/login');
  }

  // Data fetching logic is removed from here.
  // currentPage, assignments, totalAssignments are managed by PageAwareDataLoader and the server action.

  return (
    // The Suspense here can provide a top-level fallback for the loader itself if needed,
    // or could be removed if PageAwareDataLoader's internal Skeleton is sufficient.
    // For robustness, keeping a light Suspense here for the initial mount of the client component.
    <Suspense fallback={<div>Loading portal...</div>}> 
      <PageAwareDataLoader
        userId={userId}
        userRole={userRole}
       pageSize={PAGE_SIZE}
     />
    </Suspense>
  );
}
