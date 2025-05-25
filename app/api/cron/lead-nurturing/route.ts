import { NextRequest, NextResponse } from 'next/server'
import { leadNurturingService } from '@/lib/lead-nurturing'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Starting lead nurturing cron job...')
    
    // Process all nurture sequences
    const results = await leadNurturingService.processNurtureSequences()
    
    console.log('📈 Lead nurturing completed:', {
      sequencesProcessed: results.sequencesProcessed,
      messagesScheduled: results.messagesScheduled,
      enrollmentsCompleted: results.enrollmentsCompleted,
      errors: results.errors.length
    })

    // Log details for monitoring
    if (results.errors.length > 0) {
      console.error('⚠️ Lead nurturing errors:', results.errors)
    }

    return NextResponse.json({
      success: true,
      message: 'Lead nurturing completed successfully',
      results
    })

  } catch (error) {
    console.error('❌ Error in lead nurturing cron job:', error)
    
    return NextResponse.json(
      { 
        error: 'Lead nurturing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
} 