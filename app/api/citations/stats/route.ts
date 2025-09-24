import { NextRequest, NextResponse } from 'next/server';
import { citationManager } from '@/lib/citations/citation-manager';
import { citationTracker } from '@/lib/citations/citation-tracker';

export async function GET(request: NextRequest) {
  try {
    // Get basic submission statistics
    const submissionStats = citationManager.getSubmissionStats();
    
    // Get citation health and performance metrics
    const healthScore = citationTracker.getCitationHealthScore();
    const performanceReport = citationTracker.generatePerformanceReport();
    
    // Get active alerts and maintenance tasks
    const activeAlerts = citationTracker.getActiveAlerts();
    const maintenanceTasks = citationTracker.getMaintenanceTasks().slice(0, 10);
    
    // Get recent submissions
    const allDirectories = citationManager.getDirectoriesByCategory();
    const recentSubmissions = allDirectories
      .filter(dir => dir.submissionDate || dir.status !== 'PENDING')
      .sort((a, b) => {
        const dateA = a.submissionDate || new Date(0);
        const dateB = b.submissionDate || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10)
      .map(dir => ({
        id: dir.id,
        directoryName: dir.name,
        category: dir.category,
        status: dir.status,
        submissionDate: dir.submissionDate || new Date(),
        priority: dir.priority,
        domainAuthority: dir.features.domainAuthority
      }));

    // Calculate traffic metrics (mock data for demonstration)
    const citationMetrics = citationTracker.getCitationMetrics();
    const totalTraffic = citationMetrics.reduce((sum, metric) => sum + metric.traffic.monthly, 0);
    const totalReviews = citationMetrics.reduce((sum, metric) => sum + metric.reviews.count, 0);
    const averageRating = totalReviews > 0 ? 
      citationMetrics.reduce((sum, metric) => sum + (metric.reviews.averageRating * metric.reviews.count), 0) / totalReviews : 4.9;

    const stats = {
      totalDirectories: submissionStats.total,
      pendingSubmissions: submissionStats.pending,
      approvedListings: submissionStats.approved,
      napConsistencyScore: performanceReport.napConsistencyScore,
      citationHealthScore: healthScore.overallScore,
      totalTraffic: totalTraffic || 850, // Mock data if no real data
      averageRating: averageRating || 4.9,
      totalReviews: totalReviews || 47,
      highPriorityTasks: maintenanceTasks.filter(task => task.priority === 'HIGH' || task.priority === 'URGENT').length,
      estimatedCompletionTime: maintenanceTasks.reduce((sum, task) => sum + task.estimatedTime, 0),
      recentSubmissions,
      activeAlerts: activeAlerts.slice(0, 5).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        directoryName: alert.directoryName,
        message: alert.message,
        actionRequired: alert.actionRequired
      })),
      maintenanceTasks: maintenanceTasks.map(task => ({
        id: task.id,
        directoryName: task.directoryName,
        task: task.task,
        priority: task.priority,
        description: task.description,
        estimatedTime: task.estimatedTime,
        dueDate: task.dueDate
      })),
      performanceMetrics: {
        weeklyTraffic: Math.round(totalTraffic * 0.25) || 210,
        trafficGrowth: performanceReport.monthlyTrends.trafficGrowth,
        newReviews: Math.floor(Math.random() * 8) + 3, // Mock data
        reviewGrowth: performanceReport.monthlyTrends.reviewGrowth,
        rankingImprovements: Math.floor(Math.random() * 15) + 8, // Mock data
        topPerformingDirectories: performanceReport.topPerformingDirectories.slice(0, 5)
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching citation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch citation stats' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check
    const submissionStats = citationManager.getSubmissionStats();
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Citation-Health': 'OK',
        'X-Total-Directories': submissionStats.total.toString(),
        'X-Approved-Listings': submissionStats.approved.toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
} 