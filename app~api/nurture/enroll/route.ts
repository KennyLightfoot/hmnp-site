import { NextRequest, NextResponse } from 'next/server'
import { leadNurturingService } from '@/lib/lead-nurturing'
import { withRateLimit } from '@/lib/security/rate-limiting'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email(),
  sequenceId: z.string().min(1),
  metadata: z.record(z.any()).optional(),
})

export const POST = withRateLimit('public', 'nurture_enroll')(async (request: NextRequest) => {
  try {
    const json = await request.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 })
    }
    const { email, sequenceId, metadata } = parsed.data

    // Validate request
    if (!email || !sequenceId) {
      return NextResponse.json(
        { error: 'Email and sequenceId are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Enroll in sequence
    await leadNurturingService.enrollInSequence(email, sequenceId, metadata || {})

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled ${email} in sequence: ${sequenceId}`
    })

  } catch (error) {
    console.error('Error enrolling in nurture sequence:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in sequence' },
      { status: 500 }
    )
  }
})