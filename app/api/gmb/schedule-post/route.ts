import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { gmbManager } from '@/lib/gmb/manager';
import { gmbAutomationSystem } from '@/lib/gmb/automation-system';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postSchema = z.object({
  postData: z
    .object({
      content: z.string().min(1).optional(),
      scheduledTime: z.string().datetime().optional(),
      location: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
});

export const POST = withRateLimit('admin', 'gmb_schedule_post')(async (request: NextRequest) => {
  try {
    // Check if GMB is enabled
    const gmbEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    
    if (!gmbEnabled) {
      return NextResponse.json(
        { error: 'GMB posting is not enabled' },
        { status: 400 }
      );
    }

    const bodyRaw = await request.json().catch(() => ({}));
    const parsed = postSchema.safeParse(bodyRaw);
    const body = parsed.success ? parsed.data : {};
    
    // If specific post data is provided, schedule that post
    if (body.postData) {
      const { postData } = body;
      
      gmbManager.addTask({
        id: `custom-post-${Date.now()}`,
        type: 'POST',
        status: 'PENDING',
        scheduledTime: new Date(postData.scheduledTime || Date.now() + 5 * 60 * 1000), // 5 minutes from now
        data: postData,
        error: undefined,
        retryCount: 0,
        maxRetries: 3
      });

      return NextResponse.json({
        success: true,
        message: 'Custom post scheduled successfully',
        postId: `custom-post-${Date.now()}`,
        scheduledTime: postData.scheduledTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise, schedule the next batch of automated posts
    const posts = gmbAutomationSystem.generatePostingSchedule(new Date());
    
    // Add first 3 posts to the queue
    const postsToSchedule = posts.slice(0, 3);
    
    for (const post of postsToSchedule) {
      gmbManager.addTask({
        id: post.id,
        type: 'POST',
        status: 'PENDING',
        scheduledTime: post.scheduledDate,
        data: post,
        error: undefined,
        retryCount: 0,
        maxRetries: 3
      });
    }

    // Get updated task statistics
    const taskStats = gmbManager.getTaskStats();
    
    return NextResponse.json({
      success: true,
      message: `${postsToSchedule.length} posts scheduled successfully`,
      postsScheduled: postsToSchedule.length,
      taskStats,
      scheduledPosts: postsToSchedule.map(post => ({
        id: post.id,
        type: post.type,
        scheduledDate: post.scheduledDate,
        location: post.location,
        content: post.content.substring(0, 100) + '...',
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error scheduling posts:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to schedule posts',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
})

// Get current posting queue
export const GET = withRateLimit('admin', 'gmb_schedule_post_queue')(async (request: NextRequest) => {
  try {
    const gmbEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    
    if (!gmbEnabled) {
      return NextResponse.json({
        enabled: false,
        message: 'GMB posting is not enabled',
        queue: [],
        timestamp: new Date().toISOString(),
      });
    }

    // Get upcoming tasks (next 7 days)
    const upcomingTasks = gmbManager.getUpcomingTasks(168);
    const postTasks = upcomingTasks.filter(task => task.type === 'POST');
    
    // Get task statistics
    const taskStats = gmbManager.getTaskStats();
    
    return NextResponse.json({
      enabled: true,
      taskStats,
      queue: postTasks.map(task => ({
        id: task.id,
        status: task.status,
        scheduledTime: task.scheduledTime,
        type: task.data.type || 'STANDARD',
        location: task.data.location || 'Houston Area',
        content: task.data.content?.substring(0, 100) + '...' || 'Post content',
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
        error: task.error,
      })),
      summary: {
        totalPosts: postTasks.length,
        pendingPosts: postTasks.filter(t => t.status === 'PENDING').length,
        processingPosts: postTasks.filter(t => t.status === 'PROCESSING').length,
        failedPosts: postTasks.filter(t => t.status === 'FAILED').length,
        nextScheduledPost: postTasks.find(t => t.status === 'PENDING')?.scheduledTime || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting posting queue:', error);
    
    return NextResponse.json({
      enabled: false,
      error: 'Failed to get posting queue',
      details: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
})

// Cancel a scheduled post
export const DELETE = withRateLimit('admin', 'gmb_schedule_post_cancel')(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { postId } = body;
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find and cancel the task
    const upcomingTasks = gmbManager.getUpcomingTasks(168);
    const taskToCancel = upcomingTasks.find(task => task.id === postId);
    
    if (!taskToCancel) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (taskToCancel.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Cannot cancel post that is currently being processed' },
        { status: 400 }
      );
    }

    // Mark task as cancelled by setting status to FAILED
    taskToCancel.status = 'FAILED';
    taskToCancel.error = 'Cancelled by user';
    
    return NextResponse.json({
      success: true,
      message: 'Post cancelled successfully',
      postId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error cancelling post:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel post',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
})
