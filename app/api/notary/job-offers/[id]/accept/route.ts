import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'
import { acceptJobOffer } from '@/lib/services/job-offer-service'
import { logger } from '@/lib/logger'
import { rateLimiters } from '@/lib/middleware/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const result = await acceptJobOffer(params.id, session.user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to accept offer' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job offer accepted successfully',
    })
  } catch (error) {
    logger.error('Error accepting job offer', { error })
    return NextResponse.json(
      { error: 'Failed to accept job offer' },
      { status: 500 }
    )
  }
}

