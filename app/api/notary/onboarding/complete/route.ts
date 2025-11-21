import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user || userRole !== Role.NOTARY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { profileId } = body

    if (!profileId) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      )
    }

    // Verify profile belongs to user
    const profile = await prisma.notary_profiles.findUnique({
      where: { id: profileId },
    })

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 404 }
      )
    }

    // Verify all required fields are complete
    const requiredFieldsComplete =
      profile.commission_number &&
      profile.commission_expiry &&
      profile.eo_insurance_provider &&
      profile.eo_insurance_policy &&
      profile.eo_insurance_expiry &&
      profile.w9_on_file &&
      profile.base_address &&
      profile.states_licensed.length > 0

    if (!requiredFieldsComplete) {
      return NextResponse.json(
        { error: 'All required onboarding steps must be completed' },
        { status: 400 }
      )
    }

    // Update status to complete (admin will activate)
    await prisma.notary_profiles.update({
      where: { id: profileId },
      data: {
        onboarding_status: 'COMPLETE',
      },
    })

    logger.info('Notary onboarding completed', {
      userId: session.user.id,
      profileId,
    })

    // TODO: Send notification to admin for final activation

    return NextResponse.json({
      success: true,
      message: 'Onboarding submitted for review',
    })
  } catch (error) {
    logger.error('Error completing onboarding', { error })
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

