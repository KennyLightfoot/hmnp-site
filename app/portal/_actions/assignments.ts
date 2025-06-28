'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role, AssignmentStatus, Assignment } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Updates the status of an assignment and records the change in history.
 * Only accessible by Staff or Admin users.
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  newStatus: AssignmentStatus,
  note?: string | null
): Promise<{ error?: string; success?: boolean }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const user = session.user as any; // Use custom Session type if available
  const userId = user.id as string;
  const userRole = user.role as Role;

  if (!userId || !userRole) {
    return { error: "Authentication error" };
  }

  // Authorization Check: Only Staff or Admin can change status
  if (userRole !== Role.ADMIN && userRole !== Role.STAFF) {
    console.warn(`User ${userId} (${userRole}) unauthorized status update attempt for assignment ${assignmentId}`);
    return { error: "Unauthorized" };
  }

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Update the assignment status
      const updatedAssignment = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: newStatus,
        },
        select: { id: true } // Select minimal fields needed
      });

      if (!updatedAssignment) {
        throw new Error("Assignment not found or update failed.");
      }

      // 2. Create a status history record
      await tx.statusHistory.create({
        data: {
          assignmentId: assignmentId,
          status: newStatus,
          note: note || null,
          changedById: userId,
        },
      });
    });

    // Revalidate the assignment detail page path
    revalidatePath(`/portal/${assignmentId}`);
    // Optionally revalidate the main portal page too
    revalidatePath(`/portal`);

    return { success: true };

  } catch (error) {
    console.error(`Failed to update status for assignment ${assignmentId}:`, error);
    let errorMessage = "Failed to update status.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { error: errorMessage };
  }
}

// Re-define or import AssignmentData if it's not globally available
// For now, defining it here based on its previous definition.
export type AssignmentData = Pick<
  Assignment,
  'id' | 'title' | 'status' | 'closingDate' | 'borrowerName' | 'propertyAddress' | 'updatedAt'
>;

interface FetchAssignmentsParams {
  page: number;
  pageSize: number;
  search?: string; // Optional search term
  status?: string; // Optional status filter
  userRole: string;
  userId: string;
}

export async function fetchAssignmentsAction(params: FetchAssignmentsParams): Promise<{ assignments: AssignmentData[]; totalAssignments: number; error?: string }> {
  const { page, pageSize, search, status, userRole, userId } = params;

  try {
    const whereClause: any = {};

    // Apply user role-based filtering
    if (userRole === 'PARTNER') {
      whereClause.partnerAssignedToId = userId;
    } else if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      console.warn(`fetchAssignmentsAction: Unhandled user role for assignment fetching: ${userRole}`);
      // If not ADMIN, STAFF, or a specific PARTNER, they see nothing by default
      // Or handle as an error, depending on desired behavior
      return { assignments: [], totalAssignments: 0, error: "Unauthorized role for fetching assignments." };
    }

    // Apply status filter if provided and valid
    if (status && Object.values(AssignmentStatus).includes(status as AssignmentStatus)) {
      whereClause.status = status as AssignmentStatus;
    }

    // Apply search filter if provided
    // This is a simple search; consider more advanced full-text search for production
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { borrowerName: { contains: search, mode: 'insensitive' } },
        { propertyAddress: { contains: search, mode: 'insensitive' } },
        // Add other fields to search if necessary
      ];
    }

    const countQuery = prisma.Assignment.count({ where: whereClause });
    const dataQuery = prisma.Assignment.findMany({
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const [totalAssignments, assignments] = await Promise.all([countQuery, dataQuery]);

    return { assignments, totalAssignments };

  } catch (error) {
    console.error("Failed to fetch assignments via action:", error);
    return { assignments: [], totalAssignments: 0, error: "Error loading assignments. Please try again later." };
  }
} 