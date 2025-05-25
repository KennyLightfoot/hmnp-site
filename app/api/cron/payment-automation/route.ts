import { NextRequest, NextResponse } from 'next/server'
import { paymentAutomationService } from '@/lib/payment-automation'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting payment automation cron job...')
    
    // Process payment reminders and auto-cancellations
    const results = await paymentAutomationService.processPaymentReminders()
    
    console.log('💰 Payment automation completed:', {
      remindersProcessed: results.remindersProcessed,
      paymentsAutoCancelled: results.paymentsAutoCancelled,
      errors: results.errors.length
    })

    // Generate revenue protection report
    const report = await paymentAutomationService.generatePaymentReport(7) // Last 7 days
    
    console.log('📊 Revenue protection report:', report)

    return NextResponse.json({
      success: true,
      message: 'Payment automation completed successfully',
      results: {
        ...results,
        revenueReport: report
      }
    })

  } catch (error) {
    console.error('❌ Error in payment automation cron job:', error)
    
    return NextResponse.json(
      { 
        error: 'Payment automation failed',
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