import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { assignmentSchema } from '@/lib/validations'; // Import the Zod schema
import { z } from 'zod';

// POST /api/assignments
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check: Only Staff/Admin can create assignments
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== Role.ADMIN && userRole !== Role.STAFF)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  // 3. Create Assignment in Database
  try {
    // Ensure optional fields that shouldn't be empty strings are handled
    const createData = {
      ...data,
      borrowerName: data.borrowerName || null,
      propertyAddress: data.propertyAddress || null,
      reference: data.reference || null,
      // partnerAssignedToId and closingDate are already optional/nullable in schema
      // allowPartnerComments defaults based on schema if not provided
    };

    const newAssignment = await prisma.assignment.create({
      data: createData,
       select: { // Return basic info of the created assignment
        id: true,
        title: true,
        status: true,
      }
    });

    // Maybe revalidate tag for the assignments list page?
    // revalidateTag('assignments') // If using fetch tags

    return NextResponse.json(newAssignment, { status: 201 }); // 201 Created

  } catch (error: any) {
     // Handle potential Prisma errors, e.g., unique constraint violation on reference?
     if (error.code === 'P2002' && error.meta?.target?.includes('reference')) {
         return NextResponse.json({ error: 'An assignment with this reference already exists.' }, { status: 409 });
     }
    console.error("Failed to create assignment:", error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
} 