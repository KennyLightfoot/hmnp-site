"use client"

import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { redirect } from 'next/navigation'
import { User, Assignment, AssignmentStatus } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AssignmentsFilterControls from "@/components/assignments-filter-controls"
import { getStatusBadgeStyle, formatDateShort } from "@/lib/assignmentUtils"
import { PaginationControls } from "@/components/ui/pagination-controls"

// Define a type for the selected assignment data
type AssignmentData = Pick<
  Assignment,
  'id' | 'title' | 'status' | 'closingDate' | 'borrowerName' | 'propertyAddress' | 'updatedAt'
>;

// Helper function to format dates (optional)
/* // Removed - Moved to utils
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString()
}
*/

// Helper function to get badge variant based on status
/* // Removed - Moved to utils
const getStatusBadgeVariant = (status: AssignmentStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case AssignmentStatus.REQUESTED:
      return "outline"
    case AssignmentStatus.SCHEDULED:
      return "secondary"
    case AssignmentStatus.IN_PROGRESS:
      return "default" // Blue-ish default
    case AssignmentStatus.SIGNED:
      return "default"
    case AssignmentStatus.RETURNED_TO_TITLE:
      return "secondary"
    case AssignmentStatus.COMPLETED:
      return "default" // Consider a custom green class later if needed
    case AssignmentStatus.ARCHIVED:
      return "destructive"
    default:
      return "outline"
  }
};
*/

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
    return <p className="text-red-500">Error loading assignments. Please try again later.</p>
  }

  // Prepare initial values for the filter controls based on searchParams
  const initialSearch = searchTerm;
  const initialStatus = statusFilter;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assignments</h2>

      {/* Filter Controls Client Component */}
      <AssignmentsFilterControls initialSearch={initialSearch} initialStatus={initialStatus} />

      <div className="border rounded-lg mt-4">
        <Table>
          <TableCaption>
            {/* Dynamically update caption based on filters? */}
            A list of assignments {initialStatus ? `with status ${initialStatus}` : ''} {initialSearch ? `matching "${initialSearch}"` : ''}.
            {assignments.length === 0 && !initialStatus && !initialSearch ? "No assignments found." : ""}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Closing Date</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {/* Improved message based on whether filters are active */}
                  {initialSearch || initialStatus ? "No assignments match the current filters." : "No assignments found."}
                </TableCell>
              </TableRow>
            )}
            {assignments.map((a: AssignmentData) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  <Link href={`/portal/${a.id}`} className="text-blue-600 hover:underline">
                    {a.title || `Assignment ${a.id.substring(0, 6)}`}
                  </Link>
                </TableCell>
                <TableCell>
                  {/* Use the new utility function */}
                  {(() => {
                    const { variant, className } = getStatusBadgeStyle(a.status);
                    return <Badge variant={variant} className={className}>{a.status}</Badge>;
                  })()}
                </TableCell>
                <TableCell>{a.borrowerName || "-"}</TableCell>
                <TableCell>{a.propertyAddress || "-"}</TableCell>
                <TableCell>{formatDateShort(a.closingDate)}</TableCell> {/* Use short date format */}
                <TableCell>{formatDateShort(a.updatedAt)}</TableCell> {/* Use short date format */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* TODO: Add Pagination Controls Here, passing totalAssignments, PAGE_SIZE, currentPage */}
       <div className="mt-4 flex justify-center">
         { /* Placeholder for Pagination Component */}
         {/* <PaginationControls currentPage={currentPage} totalCount={totalAssignments} pageSize={PAGE_SIZE} /> */}
         <PaginationControls currentPage={currentPage} totalCount={totalAssignments} pageSize={PAGE_SIZE} />
       </div>

    </div>
  );
}
