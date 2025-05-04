import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { redirect } from 'next/navigation'
import { User, Assignment, AssignmentStatus } from "@prisma/client"
import AssignmentsFilterControls from "@/components/assignments-filter-controls"
import { PaginationControls } from "@/components/ui/pagination-controls"
import PortalAssignmentsView from "@/components/portal-assignments-view"

// Define a type for the selected assignment data
export type AssignmentData = Pick<
  Assignment,
  'id' | 'title' | 'status' | 'closingDate' | 'borrowerName' | 'propertyAddress' | 'updatedAt'
>;

// Define the props for the page, including searchParams
interface PortalAssignmentsPageProps {
  searchParams?: {
    search?: string;
    status?: string;
    page?: string;
  };
}

const PAGE_SIZE = 15; // Define items per page

export default async function PortalAssignmentsPage({ searchParams }: PortalAssignmentsPageProps) {
  const session = await getServerSession(authOptions)

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login') // Or your preferred login route
  }

  // Type assertion for user with id and role (assuming callbacks add them)
  // We use `any` temporarily if default Session type causes issues,
  // ideally create a custom Session type via declaration merging.
  const user = session.user as any; // More robust: create custom Session type
  const userId = user.id as string;
  const userRole = user.role as string;

  if (!userId || !userRole) {
    console.error("User ID or Role missing from session:", session.user);
    redirect('/login'); // Redirect if essential session data is missing
  }

  // Extract search and status filters from URL search params
  const searchTerm = searchParams?.search || "";
  const statusFilter = searchParams?.status || "";
  const currentPage = parseInt(searchParams?.page || '1', 10);

  let assignments: AssignmentData[] = []
  let totalAssignments = 0;

  try {
    // --- Construct the WHERE clause based on filters and role ---
    const whereClause: any = {}; // Initialize where clause

    // Add status filter if provided and valid
    if (statusFilter && Object.values(AssignmentStatus).includes(statusFilter as AssignmentStatus)) {
      whereClause.status = statusFilter as AssignmentStatus;
    }

    // Add search term filter (searching borrowerName and propertyAddress)
    if (searchTerm) {
      whereClause.OR = [
        { borrowerName: { contains: searchTerm, mode: 'insensitive' } },
        { propertyAddress: { contains: searchTerm, mode: 'insensitive' } },
         // { title: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

     // Apply role-based access control to WHERE clause
    if (userRole === 'PARTNER') {
        // Partners see only assignments assigned to them matching filters
        whereClause.partnerAssignedToId = userId;
    } else if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
        // Handle other roles or default case if necessary
        console.warn(`Unhandled user role for assignment fetching: ${userRole}`);
        // Effectively prevent fetching any data if role is unexpected
        whereClause.id = null; // Or some condition that is always false
    }
    // Admins/Staff have no additional role constraints added to whereClause

    // --- Perform the two queries: one for count, one for data ---
    const countQuery = prisma.assignment.count({ where: whereClause });

    const dataQuery = prisma.assignment.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            status: true,
            closingDate: true,
            borrowerName: true,
            propertyAddress: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc' as const,
        },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
    });

    // Execute queries concurrently
    const [count, data] = await Promise.all([countQuery, dataQuery]);

    totalAssignments = count;
    assignments = data;

  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    // Optionally render an error state here or pass error info to the view
    return <p className="text-red-500">Error loading assignments. Please try again later.</p>
  }

  // Prepare initial values for the filter controls based on searchParams
  const initialSearch = searchTerm;
  const initialStatus = statusFilter;

  // Render the client component, passing down data and necessary config
  return (
    <PortalAssignmentsView
      assignments={assignments}
      totalAssignments={totalAssignments}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      initialSearch={initialSearch}
      initialStatus={initialStatus}
    />
  );
}
