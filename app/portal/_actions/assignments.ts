'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { Role, AssignmentStatus } from "@prisma/client";
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