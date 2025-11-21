import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user || userRole !== Role.NOTARY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const offers = await prisma.jobOffer.findMany({
      where: {
        notaryId: session.user.id,
        status: status as any,
        expiresAt: {
          gte: status === 'PENDING' ? new Date() : undefined,
        },
      },
      include: {
        Booking: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ offers })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job offers' },
      { status: 500 }
    )
  }
}

