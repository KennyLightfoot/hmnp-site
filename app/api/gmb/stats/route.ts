import { NextRequest, NextResponse } from 'next/server';
import { gmbManager } from '@/lib/gmb/manager';

export async function GET(request: NextRequest) {
  try {
    // Check if GMB is enabled
    const gmbEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    
    if (!gmbEnabled) {
      return NextResponse.json({
        profileOptimized: false,
        postsScheduled: 0,
        reviewsResponded: 0,
        avgRating: 0,
        totalViews: 0,
        phoneClicks: 0,
        websiteClicks: 0,
        directionsClicks: 0,
        upcomingPosts: [],
        recentTasks: [],
        analytics: {
          weeklyViews: 0,
          weeklyClicks: 0,
          viewsChange: 0,
          clicksChange: 0,
        },
      });
    }

    // Get task statistics
    const taskStats = gmbManager.getTaskStats();
    
    // Get upcoming posts (next 24 hours)
    const upcomingTasks = gmbManager.getUpcomingTasks(24);
    const upcomingPosts = upcomingTasks
      .filter(task => task.type === 'POST')
      .map(task => ({
        id: task.id,
        scheduledDate: task.scheduledTime,
        content: task.data.content?.substring(0, 100) + '...' || 'Post content',
        location: task.data.location || 'Houston Area',
        type: task.data.type || 'STANDARD',
      }));

    // Get recent completed tasks
    const recentTasks = gmbManager.getUpcomingTasks(168) // Last 7 days
      .filter(task => task.status === 'COMPLETED')
      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
      .slice(0, 5)
      .map(task => ({
        id: task.id,
        type: task.type,
        status: task.status,
      // completedAt: new Date(), // Property does not exist on Booking model
        description: getTaskDescription(task.type, task.data),
      }));

    // Get analytics for the last 7 days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const analytics = await gmbManager.getAnalytics(startDate, endDate);
    
    // Mock some data for demonstration (replace with actual data)
    const stats = {
      profileOptimized: taskStats.completed > 0,
      postsScheduled: taskStats.pending + taskStats.processing,
      reviewsResponded: Math.floor(Math.random() * 25) + 15, // Mock data
      avgRating: 4.9,
      totalViews: analytics?.metrics.totalViews || 1250,
      phoneClicks: analytics?.metrics.phoneClicks || 85,
      websiteClicks: analytics?.metrics.websiteClicks || 120,
      directionsClicks: analytics?.metrics.directionsClicks || 95,
      upcomingPosts,
      recentTasks,
      analytics: {
        weeklyViews: analytics?.metrics.totalViews || 1250,
        weeklyClicks: (analytics?.metrics.websiteClicks || 120) + (analytics?.metrics.phoneClicks || 85),
        viewsChange: 15.2, // Mock data - would calculate from historical data
        clicksChange: 8.7, // Mock data
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching GMB stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GMB stats' },
      { status: 500 }
    );
  }
}

function getTaskDescription(type: string, data: any): string {
  switch (type) {
    case 'POST':
      return `Posted to GMB: ${data.content?.substring(0, 50) + '...' || 'New post'}`;
    case 'REVIEW_RESPONSE':
      return `Responded to ${data.rating}-star review`;
    case 'QA_RESPONSE':
      return `Answered question: ${data.question?.substring(0, 50) + '...' || 'Customer question'}`;
    case 'PROFILE_UPDATE':
      return 'Updated business profile information';
    case 'ANALYTICS':
      return 'Retrieved business analytics data';
    default:
      return `Completed ${type.toLowerCase()} task`;
  }
} 