import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role, NotaryApplicationStatus } from '@/lib/prisma-types'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
  reviewNotes: z.string().optional(),
})

type ReviewContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: ReviewContext
) {
  try {
    const { id: applicationId } = await context.params

    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user || userRole !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    const application = await prisma.notaryApplication.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const updatedApplication = await prisma.notaryApplication.update({
      where: { id: applicationId },
      data: {
        status: validatedData.status as NotaryApplicationStatus,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: validatedData.reviewNotes || null,
      },
    })

    logger.info('Notary application reviewed', {
      applicationId: updatedApplication.id,
      status: updatedApplication.status,
      reviewedBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error reviewing notary application', { error })
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}

