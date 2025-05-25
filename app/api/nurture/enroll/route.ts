import { NextRequest, NextResponse } from 'next/server'
import { leadNurturingService } from '@/lib/lead-nurturing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, sequenceId, metadata } = body

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
} 