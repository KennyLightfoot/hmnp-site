import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { assignmentSchema } from '@/lib/validations';
import { z } from 'zod';

// PUT /api/assignments/[assignmentId]
export async function PUT(
  request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const assignmentId = params.assignmentId;

    // 1. Authorization Check: Only Staff/Admin can update assignments
    const userRole = (session?.user as any)?.role;
    if (!session?.user || (userRole !== Role.ADMIN && userRole !== Role.STAFF)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // 2. Parse and Validate Request Body
    let data: z.infer<typeof assignmentSchema>;
    try {
      const json = await request.json();
      data = assignmentSchema.parse(json);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // 3. Update Assignment in Database
    try {
       // Ensure optional fields that shouldn't be empty strings are handled
      const updateData = {
        ...data,
        borrowerName: data.borrowerName || null,
        propertyAddress: data.propertyAddress || null,
        reference: data.reference || null,
        // partnerAssignedToId and closingDate are already optional/nullable in schema
        // allowPartnerComments defaults based on schema if not provided
      };

      const updatedAssignment = await prisma.assignment.update({
        where: {
          id: assignmentId,
        },
        data: updateData,
         select: { // Return basic info of the updated assignment
          id: true,
          title: true,
          status: true,
        }
      });

      // Maybe revalidate tag?
      // revalidateTag(`assignment-${assignmentId}`)

      return NextResponse.json(updatedAssignment);

    } catch (error: any) {
      // Handle potential errors, e.g., assignment not found or unique constraint
      if (error.code === 'P2025') { // Prisma code for record to update not found
         return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }
       if (error.code === 'P2002' && error.meta?.target?.includes('reference')) {
           return NextResponse.json({ error: 'An assignment with this reference already exists.' }, { status: 409 });
       }
      console.error(`Failed to update assignment ${assignmentId}:`, error);
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// Optional: Add GET handler to fetch single assignment details if needed elsewhere
// Optional: Add DELETE handler for assignments? 