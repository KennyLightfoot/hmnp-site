import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils/error-utils'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Normalize shape for the Success page expectations
    const payload = {
      id: booking.id,
      serviceType: (booking as any).service?.serviceType || (booking as any).serviceType || 'STANDARD_NOTARY',
      customerName: (booking as any).customerName || '',
      customerEmail: (booking as any).customerEmail || '',
      scheduledDateTime: booking.scheduledDateTime?.toISOString?.() || (booking as any).scheduledDateTime || '',
      addressStreet: (booking as any).addressStreet || (booking as any).locationAddress || '',
      addressCity: (booking as any).addressCity || '',
      addressState: (booking as any).addressState || '',
      addressZip: (booking as any).addressZip || '',
    }

    return NextResponse.json({ booking: payload })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve booking', message: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

 