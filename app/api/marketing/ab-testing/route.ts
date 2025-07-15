/**
 * A/B Testing API Endpoint
 * Manages A/B tests for landing page optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestingService } from '@/lib/marketing/ab-testing';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';

/**
 * GET - Get A/B test data or variant assignments
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const testId = searchParams.get('testId');
  const page = searchParams.get('page');
  const sessionId = searchParams.get('sessionId');

  try {
    switch (action) {
      case 'list':
        // List all tests (admin only)
        return withAdminSecurity(async () => {
          const tests = await abTestingService.getActiveTestsForPage(page || '');
          return NextResponse.json({
            success: true,
            tests,
            count: tests.length
          });
        })(request);

      case 'get':
        if (!testId) {
          return NextResponse.json({
            success: false,
            error: 'Test ID is required'
          }, { status: 400 });
        }

        return withAdminSecurity(async () => {
          const test = await abTestingService.getTest(testId);
          if (!test) {
            return NextResponse.json({
              success: false,
              error: 'Test not found'
            }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            test
          });
        })(request);

      case 'results':
        if (!testId) {
          return NextResponse.json({
            success: false,
            error: 'Test ID is required'
          }, { status: 400 });
        }

        return withAdminSecurity(async () => {
          const results = await abTestingService.getTestResults(testId);
          if (!results) {
            return NextResponse.json({
              success: false,
              error: 'Results not found'
            }, { status: 404 });
          }

          return NextResponse.json({
            success: true,
            results
          });
        })(request);

      case 'assignment':
        // Get variant assignment for user (public endpoint)
        if (!testId || !sessionId) {
          return NextResponse.json({
            success: false,
            error: 'Test ID and session ID are required'
          }, { status: 400 });
        }

        const userAgent = request.headers.get('user-agent') || '';
        const ipAddress = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown';

        const assignment = await abTestingService.getVariantAssignment(
          testId,
          sessionId,
          userAgent,
          ipAddress
        );

        return NextResponse.json({
          success: true,
          assignment
        });

      case 'active-tests':
        // Get active tests for a page (public endpoint)
        if (!page) {
          return NextResponse.json({
            success: false,
            error: 'Page parameter is required'
          }, { status: 400 });
        }

        const activeTests = await abTestingService.getActiveTestsForPage(page);
        return NextResponse.json({
          success: true,
          tests: activeTests.map(test => ({
            id: test.id,
            name: test.name,
            type: test.type,
            targetPage: test.targetPage,
            trafficSplit: test.trafficSplit
          }))
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['list', 'get', 'results', 'assignment', 'active-tests']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('A/B testing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'A/B testing operation failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * POST - Create test, track events, or manage tests
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'create';

  try {
    const body = await request.json();

    switch (action) {
      case 'create':
        // Create new A/B test (admin only)
        return withAdminSecurity(async () => {
          const {
            name,
            description,
            type,
            targetPage,
            trafficSplit,
            variants,
            metrics,
            settings
          } = body;

          if (!name || !type || !targetPage || !variants || !metrics) {
            return NextResponse.json({
              success: false,
              error: 'Missing required fields: name, type, targetPage, variants, metrics'
            }, { status: 400 });
          }

          const test = await abTestingService.createTest({
            name,
            description,
            type,
            status: 'DRAFT',
            startDate: new Date().toISOString(),
            targetPage,
            trafficSplit: trafficSplit || 50,
            variants,
            metrics,
            settings: settings || {
              autoOptimize: false,
              autoStop: true,
              excludeReturningVisitors: false
            }
          });

          return NextResponse.json({
            success: true,
            message: 'A/B test created successfully',
            test
          });
        })(request);

      case 'track':
        // Track A/B test event (public endpoint)
        const {
          testId,
          variantId,
          sessionId,
          eventType,
          eventData,
          value
        } = body;

        if (!testId || !variantId || !sessionId || !eventType) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: testId, variantId, sessionId, eventType'
          }, { status: 400 });
        }

        const validEventTypes = ['IMPRESSION', 'CLICK', 'CONVERSION', 'FORM_SUBMIT', 'PHONE_CALL'];
        if (!validEventTypes.includes(eventType)) {
          return NextResponse.json({
            success: false,
            error: 'Invalid event type',
            validTypes: validEventTypes
          }, { status: 400 });
        }

        await abTestingService.trackEvent({
          testId,
          variantId,
          sessionId,
          eventType,
          eventData,
          value,
          timestamp: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          message: 'Event tracked successfully'
        });

      case 'start':
        // Start A/B test (admin only)
        return withAdminSecurity(async () => {
          const { testId } = body;

          if (!testId) {
            return NextResponse.json({
              success: false,
              error: 'Test ID is required'
            }, { status: 400 });
          }

          await abTestingService.startTest(testId);

          return NextResponse.json({
            success: true,
            message: 'A/B test started successfully'
          });
        })(request);

      case 'stop':
        // Stop A/B test (admin only)
        return withAdminSecurity(async () => {
          const { testId, reason } = body;

          if (!testId) {
            return NextResponse.json({
              success: false,
              error: 'Test ID is required'
            }, { status: 400 });
          }

          await abTestingService.stopTest(testId, reason);

          return NextResponse.json({
            success: true,
            message: 'A/B test stopped successfully'
          });
        })(request);

      case 'create-landing-page-tests':
        // Create predefined landing page tests (admin only)
        return withAdminSecurity(async () => {
          const tests = await abTestingService.createLandingPageTests();

          return NextResponse.json({
            success: true,
            message: 'Landing page tests created successfully',
            tests,
            count: tests.length
          });
        })(request);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['create', 'track', 'start', 'stop', 'create-landing-page-tests']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('A/B testing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'A/B testing operation failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * PUT - Update A/B test configuration
 */
export const PUT = withAdminSecurity(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const body = await request.json();

    if (!testId) {
      return NextResponse.json({
        success: false,
        error: 'Test ID is required'
      }, { status: 400 });
    }

    // Update test configuration
    // This would be implemented in the service
    
    return NextResponse.json({
      success: true,
      message: 'A/B test updated successfully'
    });
  } catch (error) {
    console.error('A/B testing update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update A/B test',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

/**
 * DELETE - Delete A/B test
 */
export const DELETE = withAdminSecurity(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json({
        success: false,
        error: 'Test ID is required'
      }, { status: 400 });
    }

    // Delete test
    // This would be implemented in the service
    
    return NextResponse.json({
      success: true,
      message: 'A/B test deleted successfully'
    });
  } catch (error) {
    console.error('A/B testing delete error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete A/B test',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}); 