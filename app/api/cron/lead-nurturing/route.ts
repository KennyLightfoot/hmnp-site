import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils/error-utils';
import { leadNurturingService } from '@/lib/lead-nurturing'
import { withRateLimit } from '@/lib/security/rate-limiting'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withRateLimit('admin', 'cron_lead_nurturing')(async (request: NextRequest) => {
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
    console.error('❌ Error in lead nurturing cron job:', getErrorMessage(error))
    
    return NextResponse.json(
      { 
        error: 'Lead nurturing failed',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

// Allow GET for manual testing
export const GET = withRateLimit('admin', 'cron_lead_nurturing_get')(async (request: NextRequest) => {
  return POST(request)
})
