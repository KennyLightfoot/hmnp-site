import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { citationManager } from '@/lib/citations/citation-manager';
import { citationBuilder } from '@/lib/citations/citation-builder';
import { citationTracker } from '@/lib/citations/citation-tracker';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting citation management initialization...');
    
    // Check API key authentication for internal operations
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.INTERNAL_API_KEY;
    
    // Allow initialization without API key for dashboard usage
    const isAuthenticated = !authHeader || (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === apiKey);
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current business information
    const businessInfo = citationManager.getBusinessInfo();
    console.log(`📋 Business: ${businessInfo.name}`);
    console.log(`📍 Service Area: ${businessInfo.serviceArea.cities.length} cities`);
    
    // Get initial submission statistics
    const initialStats = citationManager.getSubmissionStats();
    console.log(`📊 Initial Stats: ${initialStats.pending} pending, ${initialStats.approved} approved`);
    
    // Generate bulk submission plan
    const submissionPlan = citationBuilder.generateBulkSubmissionPlan();
    console.log(`📅 Submission Plan: ${submissionPlan.totalEstimatedTime} minutes total`);
    
    // Check for existing alerts and issues
    const existingAlerts = citationTracker.getActiveAlerts();
    console.log(`⚠️ Active Alerts: ${existingAlerts.length}`);
    
    // Perform initial health check
    const healthScore = citationTracker.getCitationHealthScore();
    console.log(`💪 Citation Health Score: ${healthScore.overallScore}%`);
    
    // Check for new issues
    const newAlerts = citationTracker.checkForIssues();
    console.log(`🔍 New Issues Found: ${newAlerts.length}`);
    
    // Generate NAP consistency report
    const napReport = citationBuilder.generateNAPReport();
    console.log(`🏷️ NAP Consistency: ${napReport.name.consistent ? 'OK' : 'NEEDS_ATTENTION'}`);
    
    // Create initial maintenance tasks for high-priority directories
    const highPriorityDirectories = citationManager.getDirectoriesByPriority(1);
    const pendingHighPriority = highPriorityDirectories.filter(dir => dir.status === 'PENDING');
    
    let tasksCreated = 0;
    for (const directory of pendingHighPriority.slice(0, 5)) {
      const template = citationBuilder.generateSubmissionTemplate(directory.id);
      if (template) {
        const taskId = citationTracker.addMaintenanceTask({
          directoryId: directory.id,
          directoryName: directory.name,
          task: 'VERIFY_LISTING',
          priority: 'HIGH',
          description: `Submit business listing to ${directory.name} (Priority ${directory.priority})`,
          estimatedTime: template.estimatedTime,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        tasksCreated++;
        console.log(`✅ Created task for ${directory.name}: ${taskId}`);
      }
    }
    
    // Update directory statuses for initialization
    for (const directory of pendingHighPriority.slice(0, 3)) {
      citationManager.updateDirectoryStatus(directory.id, 'SUBMITTED', {
        submissionDate: new Date()
      });
      console.log(`📤 Marked ${directory.name} as submitted`);
    }
    
    // Get updated statistics after initialization
    const finalStats = citationManager.getSubmissionStats();
    const finalHealthScore = citationTracker.getCitationHealthScore();
    
    console.log('✅ Citation management initialization completed successfully');
    
    const response = {
      success: true,
      message: 'Citation management system initialized successfully',
      initialization: {
        businessInfo: {
          name: businessInfo.name,
          serviceAreaCities: businessInfo.serviceArea.cities.length,
          zipCodes: businessInfo.serviceArea.zipCodes.length
        },
        statistics: {
          before: initialStats,
          after: finalStats,
          tasksCreated,
          alertsGenerated: newAlerts.length
        },
        healthScore: {
          overall: finalHealthScore.overallScore,
          napConsistency: napReport.name.consistent,
          factors: Object.keys(finalHealthScore.factors)
        },
        submissionPlan: {
          week1Directories: submissionPlan.week1.length,
          week2Directories: submissionPlan.week2.length,
          week3Directories: submissionPlan.week3.length,
          week4Directories: submissionPlan.week4.length,
          totalEstimatedTime: submissionPlan.totalEstimatedTime
        },
        nextSteps: [
          `Complete ${pendingHighPriority.length} high-priority directory submissions`,
          `Address ${newAlerts.length} citation issues identified`,
          `Maintain ${finalHealthScore.overallScore}% citation health score`,
          'Monitor NAP consistency across all directories',
          'Set up automated citation monitoring'
        ]
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error initializing citation management:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize citation management system',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get initialization status
export async function GET(request: NextRequest) {
  try {
    const stats = citationManager.getSubmissionStats();
    const healthScore = citationTracker.getCitationHealthScore();
    const activeAlerts = citationTracker.getActiveAlerts();
    const pendingTasks = citationTracker.getMaintenanceTasks();
    
    const status = {
      initialized: stats.approved > 0 || stats.submitted > 0,
      totalDirectories: stats.total,
      pendingSubmissions: stats.pending,
      approvedListings: stats.approved,
      submittedListings: stats.submitted,
      healthScore: healthScore.overallScore,
      activeAlerts: activeAlerts.length,
      pendingTasks: pendingTasks.length,
      readiness: {
        businessInfoComplete: true,
        napConsistency: healthScore.factors.napConsistency.score >= 95,
        minimumDirectories: stats.approved >= 5,
        healthyScore: healthScore.overallScore >= 70
      },
      recommendations: healthScore.recommendations.slice(0, 3),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking citation initialization status:', error);
    
    return NextResponse.json({
      initialized: false,
      error: 'Failed to check initialization status',
      details: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 
