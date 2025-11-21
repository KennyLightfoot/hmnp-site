import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'
import { logger } from '@/lib/logger'
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user || userRole !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const application = await prisma.notaryApplication.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Application must be approved before converting to user' },
        { status: 400 }
      )
    }

    if (application.convertedToUserId) {
      return NextResponse.json(
        { error: 'Application has already been converted to a user account' },
        { status: 400 }
      )
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Generate a temporary password
    const tempPassword = randomBytes(12).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: application.email,
        name: `${application.firstName} ${application.lastName}`,
        role: Role.NOTARY,
        password: hashedPassword,
        emailVerified: null, // They'll need to verify via email
      },
    })

    // Create notary profile
    await prisma.notary_profiles.create({
      data: {
        user_id: user.id,
        commission_number: application.commissionNumber,
        commission_expiry: application.commissionExpiry,
        base_address: application.baseAddress,
        base_zip: application.baseZip,
        service_radius_miles: application.serviceRadiusMiles || 25,
        preferred_service_types: application.serviceTypes,
        preferred_zip_codes: application.countiesServed || [],
        states_licensed: application.statesLicensed,
        counties_served: application.countiesServed || [],
        languages_spoken: application.languagesSpoken || [],
        special_certifications: application.specialCertifications || [],
        eo_insurance_provider: application.eoInsuranceProvider,
        eo_insurance_policy: application.eoInsurancePolicy,
        eo_insurance_expiry: application.eoInsuranceExpiry,
        years_experience: application.yearsExperience,
        onboarding_status: 'IN_PROGRESS',
        is_active: false, // Start inactive until onboarding complete
      },
    })

    // Update application to mark as converted
    await prisma.notaryApplication.update({
      where: { id: params.id },
      data: {
        status: 'CONVERTED',
        convertedToUserId: user.id,
        convertedAt: new Date(),
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    })

    // TODO: Send invitation email with temporary password
    // TODO: Send welcome email with onboarding instructions

    logger.info('Notary application converted to user', {
      applicationId: application.id,
      userId: user.id,
      email: user.email,
      convertedBy: session.user.id,
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      tempPassword, // In production, send this via email, don't return it
      message: 'User account created successfully',
    })
  } catch (error) {
    logger.error('Error converting notary application to user', { error })
    return NextResponse.json(
      { error: 'Failed to convert application to user account' },
      { status: 500 }
    )
  }
}

