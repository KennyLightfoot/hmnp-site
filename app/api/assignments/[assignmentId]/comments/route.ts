import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@/lib/prisma-types';
import { randomUUID } from 'crypto';

// POST /api/assignments/[assignmentId]/comments
export async function POST(
  request: Request,
  context: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const assignmentId = params.assignmentId;

    const userId = session.user.id;
    // Explicitly type user role from session if necessary, assuming it's available
    const userRole = (session.user as any).role as Role;

    // 2. Authorization and Validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { allowPartnerComments: true }, // Only select needed field
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Only Partners can comment, and only if allowed on the assignment
    if (userRole !== Role.PARTNER) {
       return NextResponse.json({ error: 'Forbidden: Only partners can comment.' }, { status: 403 });
    }
     if (!assignment.allowPartnerComments) {
       return NextResponse.json({ error: 'Forbidden: Comments are not enabled for this assignment.' }, { status: 403 });
    }

    // 3. Parse Request Body
    let text: string;
    try {
      const body = await request.json();
      text = body.text;
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return NextResponse.json({ error: 'Comment text cannot be empty' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }


    // 4. Create Comment
    const newComment = await prisma.comment.create({
      data: {
        id: randomUUID(),
        text: text.trim(),
        assignmentId: assignmentId,
        authorId: userId,
      },
       // Optionally select fields to return
      select: {
        id: true,
        text: true,
        createdAt: true,
        User: { // Include author info in the response
          select: {
            id: true,
            name: true,
            email: true, // Or just name/image
            image: true
          }
        }
      }
    });

    // 5. Return Response
    return NextResponse.json(newComment, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Failed to create comment for assignment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
} 