"use client"

import Link from "next/link"
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
import { Assignment } from "@prisma/client"
import AssignmentsFilterControls from "@/components/assignments-filter-controls"
import { getStatusBadgeStyle, formatDateShort } from "@/lib/assignmentUtils"
import { PaginationControls } from "@/components/ui/pagination-controls"

// Type for the assignment data subset passed from the server
// This should match the select clause in the parent server component
export type AssignmentData = Pick<
  Assignment,
  'id' | 'title' | 'status' | 'closingDate' | 'borrowerName' | 'propertyAddress' | 'updatedAt'
>;

// Props interface for the client component
interface PortalAssignmentsViewProps {
  assignments: AssignmentData[];
  totalAssignments: number;
  currentPage: number;
  pageSize: number;
  currentSearch: string;
  currentStatus: string;
}

export default function PortalAssignmentsView({
  assignments,
  totalAssignments,
  currentPage,
  pageSize,
  currentSearch,
  currentStatus,
}: PortalAssignmentsViewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assignments</h2>

      {/* Filter Controls Client Component */}
      {/* It receives initial values but manages its own state/updates URL */}
      <AssignmentsFilterControls initialSearch={currentSearch} initialStatus={currentStatus} />

      <div className="border rounded-lg mt-4">
        <Table>
          <TableCaption>
            A list of assignments {currentStatus ? `with status ${currentStatus}` : ''} {currentSearch ? `matching "${currentSearch}"` : ''}.
            {assignments.length === 0 && !currentStatus && !currentSearch ? "No assignments found." : ""}
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
                  {currentSearch || currentStatus ? "No assignments match the current filters." : "No assignments found."}
                </TableCell>
              </TableRow>
            )}
            {assignments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  {/* Link still works in Client Components */}
                  <Link href={`/portal/${a.id}`} className="text-blue-600 hover:underline">
                    {a.title || `Assignment ${a.id.substring(0, 6)}`}
                  </Link>
                </TableCell>
                <TableCell>
                  {/* Use utility function for badge style */}
                  {(() => {
                    const { variant, className } = getStatusBadgeStyle(a.status);
                    return <Badge variant={variant} className={className}>{a.status}</Badge>;
                  })()}
                </TableCell>
                <TableCell>{a.borrowerName || "-"}</TableCell>
                <TableCell>{a.propertyAddress || "-"}</TableCell>
                <TableCell>{formatDateShort(a.closingDate)}</TableCell>
                <TableCell>{formatDateShort(a.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls - receives props to calculate pages */}
      <div className="mt-4 flex justify-center">
        <PaginationControls currentPage={currentPage} totalCount={totalAssignments} pageSize={pageSize} />
      </div>

    </div>
  );
} 