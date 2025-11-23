import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from 'next/navigation'
import { User, Assignment, AssignmentStatus, Role, AssignmentDocument, StatusHistory, Comment } from "@/lib/prisma-types"
import { Badge } from "@/components/ui/badge" // Re-use badge for status display
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // For lists
import { Button } from "@/components/ui/button" // For download button
import { DownloadIcon } from "lucide-react" // Icon for download
import { DownloadDocumentButton } from "@/components/portal/DownloadDocumentButton"; // Import the new button component
import { UploadDocumentForm } from "@/components/portal/UploadDocumentForm"; // Import the upload form
import { UpdateStatusForm } from "@/components/portal/UpdateStatusForm"; // Import the status form
import { CommentForm } from "@/components/portal/CommentForm"; // Placeholder for the new comment form
import { CommentList } from "@/components/portal/CommentList"; // Placeholder for the comment list display
import { getStatusBadgeStyle, formatDateTime } from "@/lib/assignmentUtils"; // Import new utils

// TODO: Re-use or move the helper from the list page if needed globally
/* // Removed - Moved to utils
const getStatusBadgeVariant = (status: AssignmentStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case AssignmentStatus.REQUESTED: return "outline";
    case AssignmentStatus.SCHEDULED: return "secondary";
    case AssignmentStatus.IN_PROGRESS: return "default";
    case AssignmentStatus.SIGNED: return "default";
    case AssignmentStatus.RETURNED_TO_TITLE: return "secondary";
    case AssignmentStatus.COMPLETED: return "default"; // Consider green later
    case AssignmentStatus.ARCHIVED: return "destructive";
    default: return "outline";
  }
};
*/

// Helper function to format dates (optional, can move to utils)
/* // Removed - Moved to utils
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-"
  return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString(); // Add time
}
*/

// Extend the Assignment type to include the relations we will fetch
type AssignmentWithDetails = Assignment & {
  documents: (AssignmentDocument & { uploadedBy: User | null })[];
  history: (StatusHistory & { changedBy: User | null })[];
  comments: (Comment & { author: User | null })[]; // Include comments with author
};

type AssignmentDetailPageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  // console.log('[AssignmentDetailPage] Received params:', JSON.stringify(params)); // Commented out due to Next.js warning
  const session = await getServerSession(authOptions);
  // Ensure params is resolved before accessing its properties
  const resolvedParams = await params;
  const assignmentId = resolvedParams.assignmentId;
  console.log('[AssignmentDetailPage] Extracted assignmentId:', assignmentId); // Log the extracted assignmentId

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const userId = user.id as string;
  const userRole = user.role as Role; // Use the Role enum

  if (!userId || !userRole) {
    console.error("User ID or Role missing from session");
    redirect('/login');
  }

  let assignment: AssignmentWithDetails | null = null;
  try {
    const assignmentData = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        AssignmentDocument: true,
        StatusHistory: true,
        Comment: true
      }
    });

    if (assignmentData) {
      // Transform the data to match AssignmentWithDetails interface
      assignment = {
        ...assignmentData,
        documents: assignmentData.AssignmentDocument.map((doc: any) => ({
          ...doc,
          uploadedBy: null // Since the relation doesn't exist in schema
        })),
        history: assignmentData.StatusHistory.map((history: any) => ({
          ...history,
          changedBy: null // Since the relation doesn't exist in schema
        })),
        comments: assignmentData.Comment.map((comment: any) => ({
          ...comment,
          author: null // Since the relation doesn't exist in schema
        }))
      };
    }
  } catch (error) {
    console.error(`Failed to fetch assignment ${assignmentId}:`, error);
    // Consider showing a more user-friendly error message
    return <p className="text-red-500">Error loading assignment details.</p>;
  }

  if (!assignment) {
    console.log(`[AssignmentDetailPage] Assignment not found for ID: ${assignmentId}. Calling notFound().`); // Log before calling notFound()
    notFound(); // Triggers the not-found page
  }

  // Authorization Check
  const isStaffOrAdmin = userRole === Role.ADMIN || userRole === Role.STAFF;
  const isAssignedPartner = userRole === Role.PARTNER && assignment.partnerAssignedToId === userId;

  if (!isStaffOrAdmin && !isAssignedPartner) {
    // If user is not staff/admin and not the assigned partner, deny access
    console.warn(`User ${userId} (${userRole}) unauthorized access attempt for assignment ${assignmentId}`);
    notFound(); // Or redirect('/unauthorized') or similar
  }

  // --- Display Assignment Details ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{assignment.title || `Assignment Details`}</h1>
        <p className="text-sm text-muted-foreground">Reference: {assignment.reference || assignment.id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
             {/* Use the new utility function */}
             {(() => {
                const { variant, className } = getStatusBadgeStyle(assignment.status);
                return <Badge variant={variant} className={className}>{assignment.status}</Badge>;
            })()}
        </div>
         <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Closing Date</p>
            <p className="text-lg font-semibold">{formatDateTime(assignment.closingDate)}</p> {/* Use new util */}
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="text-lg font-semibold">{formatDateTime(assignment.updatedAt)}</p> {/* Use new util */}
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Borrower</p>
            <p className="text-lg font-semibold">{assignment.borrowerName || "-"}</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-1 md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Property Address</p>
            <p className="text-lg font-semibold">{assignment.propertyAddress || "-"}</p>
        </div>
        {/* TODO: Add sections for Documents and Status History */}
      </div>

      {/* Placeholder for Documents List */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Documents</h3>
        {assignment.documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignment.documents.map((doc: any) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.filename}</TableCell>
                  <TableCell>{doc.uploadedBy?.name || 'System'}</TableCell>
                  <TableCell>{formatDateTime(doc.uploadedAt)}</TableCell> {/* Use new util */}
                  <TableCell>
                    <DownloadDocumentButton documentId={doc.id} filename={doc.filename} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No documents uploaded yet.</p>
        )}
        {/* Conditionally render upload form for Staff/Admin */}
        {isStaffOrAdmin && (
           <UploadDocumentForm assignmentId={assignment.id} />
        )}
      </div>

       {/* Placeholder for Status History */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-2">Status History</h3>
        {assignment.history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Changed At</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignment.history.map((hist: any) => (
                <TableRow key={hist.id}>
                  <TableCell>
                    {/* Use the new utility function */}
                    {(() => {
                        const { variant, className } = getStatusBadgeStyle(hist.status);
                        return <Badge variant={variant} className={className}>{hist.status}</Badge>;
                    })()}
                    </TableCell>
                  <TableCell>{hist.changedBy?.name || 'System'}</TableCell>
                  <TableCell>{formatDateTime(hist.changedAt)}</TableCell> {/* Use new util */}
                  <TableCell>{hist.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No status changes recorded yet.</p>
        )}
        {/* Conditionally render status update form for Staff/Admin */}
        {isStaffOrAdmin && (
           <UpdateStatusForm assignmentId={assignment.id} currentStatus={assignment.status} />
        )}
      </div>

      {/* Comments Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        {/* Display Existing Comments */}
        <CommentList comments={assignment.comments} />

        {/* Conditionally Render Comment Form for Assigned Partner */}
        {userRole === Role.PARTNER && assignment.allowPartnerComments && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-md font-medium mb-2">Add Comment</h4>
            <CommentForm assignmentId={assignment.id} />
          </div>
        )}
         {/* Optional: Add a note if comments are disabled */}
        {userRole === Role.PARTNER && !assignment.allowPartnerComments && (
             <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">Comments are not enabled for this assignment.</p>
        )}
      </div>

    </div>
  );
} 