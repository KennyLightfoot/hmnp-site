import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@/lib/prisma-types'
import { declineJobOffer } from '@/lib/services/job-offer-service'
import { logger } from '@/lib/logger'
import { rateLimiters } from '@/lib/middleware/rate-limit'

type DeclineRouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  context: DeclineRouteContext
) {
  try {
    const { id: offerId } = await context.params

    // Rate limiting
    const rateLimitResponse = await rateLimiters.jobOfferAccept(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user || userRole !== Role.NOTARY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const result = await declineJobOffer(offerId, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to decline offer' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job offer declined',
    })
  } catch (error) {
    logger.error('Error declining job offer', { error })
    return NextResponse.json(
      { error: 'Failed to decline job offer' },
      { status: 500 }
    )
  }
}

