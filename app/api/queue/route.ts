import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getQueueClient, getQueueWorker } from '@/lib/queue';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

/**
 * Authentication middleware for queue operations
 */
async function authenticate(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }
  
  // Expected format: "Bearer [token]"
  const [type, token] = authHeader.split(' ');
  if (!type || !token) {
    return false;
  }
  
  if (type !== 'Bearer') {
    return false;
  }
  
  // Verify against environment variable
  const isValidCronRequest = token === process.env.CRON_SECRET;
  const isValidAdminRequest = token === process.env.ADMIN_API_KEY;
  
  return isValidCronRequest || isValidAdminRequest;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postSchema = z.object({
  action: z.enum(['enqueue', 'process', 'process-single']),
  job: z.any().optional(),
});

export const POST = withRateLimit('admin', 'queue_post')(async (request: NextRequest) => {
  try {
    // Verify authentication
    const isAuthenticated = await authenticate(request);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the job from the request body
    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { action, job } = parsed.data as any;
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }
    
    // Process based on action
    switch (action) {
      case 'enqueue': {
        if (!job || !job.type) {
          return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
        }
        
        const queueClient = getQueueClient();
        const jobId = await queueClient.enqueueJob(job);
        
        return NextResponse.json({
          success: true,
          jobId,
          message: `Job added to ${job.type} queue`,
        });
      }
      
      case 'process': {
        const queueWorker = getQueueWorker();
        const result = await queueWorker.processPendingJobs();
        
        return NextResponse.json({
          success: true,
          processed: result.processed,
          errors: result.errors,
          message: `Processed ${result.processed} jobs with ${result.errors} errors`,
        });
      }
      
      case 'process-single': {
        if (!job || !job.type) {
          return NextResponse.json({ error: 'Invalid job data' }, { status: 400 });
        }
        
        const queueWorker = getQueueWorker();
        const result = await queueWorker.processJob(job);
        
        return NextResponse.json({
          success: result.success,
          jobId: result.jobId,
          processedAt: result.processedAt,
          error: result.error,
          result: result.result,
        });
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` }, 
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Queue API error:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? getErrorMessage(error) : String(error) },
      { status: 500 }
    );
  }
})

export const GET = withRateLimit('admin', 'queue_get')(async (request: NextRequest) => {
  try {
    // Verify authentication
    const isAuthenticated = await authenticate(request);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Process GET requests - mainly for status checks
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'process') {
      // Process pending jobs on demand
      const queueWorker = getQueueWorker();
      const result = await queueWorker.processPendingJobs();
      
      return NextResponse.json({
        success: true,
        processed: result.processed,
        errors: result.errors,
        message: `Processed ${result.processed} jobs with ${result.errors} errors`,
      });
    }
    
    // Default: return status info
    return NextResponse.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      message: 'Queue system is operational',
    });
    
  } catch (error) {
    logger.error('Queue API error:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? getErrorMessage(error) : String(error) },
      { status: 500 }
    );
  }
})
