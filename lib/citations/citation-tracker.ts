/**
 * Citation Tracker - Performance Monitoring and Maintenance System
 * Tracks directory submissions and monitors citation performance
 */

import { citationManager } from './citation-manager';
import type { DirectoryListing } from './citation-manager';

export interface CitationMetrics {
  directoryId: string;
  directoryName: string;
  category: string;
  status: string;
  submissionDate?: Date;
  approvalDate?: Date;
  lastChecked: Date;
  napConsistency: number;
  domainAuthority?: number;
  traffic: {
    monthly: number;
    clicks: number;
    impressions: number;
    ctr: number;
  };
  reviews: {
    count: number;
    averageRating: number;
    lastReview?: Date;
  };
  backlink: {
    exists: boolean;
    follow: boolean;
    anchor: string;
  };
  performance: {
    searchVisibility: number;
    localPackAppearances: number;
    keywordRankings: { [keyword: string]: number };
  };
}

export interface CitationAlert {
  id: string;
  type: 'NAP_INCONSISTENCY' | 'LISTING_DOWN' | 'NEGATIVE_REVIEW' | 'OUTDATED_INFO' | 'DUPLICATE_LISTING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  directoryId: string;
  directoryName: string;
  message: string;
  detectedDate: Date;
  resolved: boolean;
  actionRequired: string[];
}

export interface MaintenanceTask {
  id: string;
  directoryId: string;
  directoryName: string;
  task: 'UPDATE_INFO' | 'RESPOND_REVIEW' | 'UPLOAD_PHOTOS' | 'VERIFY_LISTING' | 'FIX_NAP' | 'REMOVE_DUPLICATE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  estimatedTime: number; // minutes
  dueDate: Date;
  completed: boolean;
  notes?: string;
}

export interface PerformanceReport {
  reportDate: Date;
  totalCitations: number;
  activeCitations: number;
  napConsistencyScore: number;
  averageDomainAuthority: number;
  totalTraffic: number;
  totalReviews: number;
  averageRating: number;
  topPerformingDirectories: string[];
  underperformingDirectories: string[];
  recommendedActions: string[];
  monthlyTrends: {
    newCitations: number;
    trafficGrowth: number;
    reviewGrowth: number;
    rankingImprovement: number;
  };
}

export class CitationTracker {
  private metrics: CitationMetrics[] = [];
  private alerts: CitationAlert[] = [];
  private maintenanceTasks: MaintenanceTask[] = [];

  constructor() {
    this.initializeMetrics();
    this.initializeMaintenanceTasks();
  }

  /**
   * Initialize metrics for all directories
   */
  private initializeMetrics(): void {
    const directories = citationManager.getDirectoriesByCategory();
    
    this.metrics = directories.map(dir => ({
      directoryId: dir.id,
      directoryName: dir.name,
      category: dir.category,
      status: dir.status,
      submissionDate: dir.submissionDate,
      approvalDate: dir.approvalDate,
      lastChecked: new Date(),
      napConsistency: dir.napConsistency,
      domainAuthority: dir.features.domainAuthority,
      traffic: {
        monthly: this.estimateTrafficFromDirectory(dir),
        clicks: 0,
        impressions: 0,
        ctr: 0
      },
      reviews: {
        count: 0,
        averageRating: 0
      },
      backlink: {
        exists: dir.features.providesBacklink,
        follow: true, // Most business directories provide follow links
        anchor: 'Houston Mobile Notary Pros'
      },
      performance: {
        searchVisibility: 0,
        localPackAppearances: 0,
        keywordRankings: {}
      }
    }));
  }

  /**
   * Estimate potential traffic from directory
   */
  private estimateTrafficFromDirectory(directory: DirectoryListing): number {
    const baseTraffic = {
      'google-my-business': 500,
      'yelp-business': 150,
      'yellow-pages': 75,
      'better-business-bureau': 50,
      'angie-list': 100,
      'nextdoor-business': 80
    };

    return baseTraffic[directory.id as keyof typeof baseTraffic] || 
           Math.round((directory.features.domainAuthority || 30) * 0.5);
  }

  /**
   * Initialize maintenance tasks
   */
  private initializeMaintenanceTasks(): void {
    const directories = citationManager.getDirectoriesByCategory();
    
    // Generate initial maintenance tasks
    directories.forEach(dir => {
      if (dir.status === 'PENDING') {
        this.maintenanceTasks.push({
          id: `submit-${dir.id}`,
          directoryId: dir.id,
          directoryName: dir.name,
          task: 'VERIFY_LISTING',
          priority: dir.priority === 1 ? 'HIGH' : 'MEDIUM',
          description: `Submit business listing to ${dir.name}`,
          estimatedTime: 15 + (dir.features.allowsPhotos ? 10 : 0),
          dueDate: new Date(Date.now() + (dir.priority * 7 * 24 * 60 * 60 * 1000)),
          completed: false
        });
      }

      if (dir.status === 'APPROVED' && dir.napConsistency < 95) {
        this.maintenanceTasks.push({
          id: `fix-nap-${dir.id}`,
          directoryId: dir.id,
          directoryName: dir.name,
          task: 'FIX_NAP',
          priority: 'HIGH',
          description: `Fix NAP inconsistency on ${dir.name} (${dir.napConsistency}% consistent)`,
          estimatedTime: 10,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          completed: false
        });
      }
    });
  }

  /**
   * Get all citation metrics
   */
  getCitationMetrics(): CitationMetrics[] {
    return this.metrics;
  }

  /**
   * Get metrics for specific directory
   */
  getDirectoryMetrics(directoryId: string): CitationMetrics | null {
    return this.metrics.find(m => m.directoryId === directoryId) || null;
  }

  /**
   * Update directory metrics
   */
  updateMetrics(directoryId: string, updates: Partial<CitationMetrics>): boolean {
    const metricIndex = this.metrics.findIndex(m => m.directoryId === directoryId);
    if (metricIndex === -1) return false;

    this.metrics[metricIndex] = { ...this.metrics[metricIndex], ...updates };
    this.metrics[metricIndex].lastChecked = new Date();
    
    return true;
  }

  /**
   * Check for citation issues and generate alerts
   */
  checkForIssues(): CitationAlert[] {
    const newAlerts: CitationAlert[] = [];

    this.metrics.forEach(metric => {
      // Check NAP consistency
      if (metric.napConsistency < 95 && metric.status === 'APPROVED') {
        newAlerts.push({
          id: `nap-${metric.directoryId}-${Date.now()}`,
          type: 'NAP_INCONSISTENCY',
          severity: metric.napConsistency < 80 ? 'HIGH' : 'MEDIUM',
          directoryId: metric.directoryId,
          directoryName: metric.directoryName,
          message: `NAP consistency is ${metric.napConsistency}% on ${metric.directoryName}`,
          detectedDate: new Date(),
          resolved: false,
          actionRequired: [
            'Review business information on directory',
            'Update name, address, phone to match standards',
            'Verify all fields are completed accurately'
          ]
        });
      }

      // Check for low traffic
      if (metric.traffic.monthly < 10 && metric.status === 'APPROVED') {
        const daysSinceApproval = metric.approvalDate ? 
          Math.floor((Date.now() - metric.approvalDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        if (daysSinceApproval > 30) {
          newAlerts.push({
            id: `traffic-${metric.directoryId}-${Date.now()}`,
            type: 'LISTING_DOWN',
            severity: 'MEDIUM',
            directoryId: metric.directoryId,
            directoryName: metric.directoryName,
            message: `Low traffic from ${metric.directoryName} (${metric.traffic.monthly}/month)`,
            detectedDate: new Date(),
            resolved: false,
            actionRequired: [
              'Check if listing is still active',
              'Verify listing appears in search results',
              'Consider optimizing listing content'
            ]
          });
        }
      }

      // Check for missing photos
      if (metric.status === 'APPROVED' && 
          this.getDirectoryFeatures(metric.directoryId)?.allowsPhotos && 
          !this.hasPhotosUploaded(metric.directoryId)) {
        newAlerts.push({
          id: `photos-${metric.directoryId}-${Date.now()}`,
          type: 'OUTDATED_INFO',
          severity: 'LOW',
          directoryId: metric.directoryId,
          directoryName: metric.directoryName,
          message: `Missing photos on ${metric.directoryName}`,
          detectedDate: new Date(),
          resolved: false,
          actionRequired: [
            'Upload business logo',
            'Add service photos',
            'Include team/location photos'
          ]
        });
      }
    });

    // Add new alerts to the collection
    this.alerts.push(...newAlerts);
    
    return newAlerts;
  }

  /**
   * Get directory features
   */
  private getDirectoryFeatures(directoryId: string): any {
    const directories = citationManager.getDirectoriesByCategory();
    return directories.find(d => d.id === directoryId)?.features;
  }

  /**
   * Check if photos are uploaded (mock implementation)
   */
  private hasPhotosUploaded(directoryId: string): boolean {
    // In real implementation, this would check if photos are uploaded
    return ['google-my-business', 'yelp-business'].includes(directoryId);
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): CitationAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    return true;
  }

  /**
   * Get maintenance tasks
   */
  getMaintenanceTasks(priority?: string): MaintenanceTask[] {
    let tasks = this.maintenanceTasks.filter(task => !task.completed);
    
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    return tasks.sort((a, b) => {
      // Sort by priority, then by due date
      const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  /**
   * Complete maintenance task
   */
  completeTask(taskId: string, notes?: string): boolean {
    const task = this.maintenanceTasks.find(t => t.id === taskId);
    if (!task) return false;

    task.completed = true;
    if (notes) task.notes = notes;
    
    return true;
  }

  /**
   * Add maintenance task
   */
  addMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'completed'>): string {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.maintenanceTasks.push({
      id: taskId,
      completed: false,
      ...task
    });

    return taskId;
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): PerformanceReport {
    const activeCitations = this.metrics.filter(m => m.status === 'APPROVED');
    const totalTraffic = activeCitations.reduce((sum, m) => sum + m.traffic.monthly, 0);
    const totalReviews = activeCitations.reduce((sum, m) => sum + m.reviews.count, 0);
    
    const averageRating = totalReviews > 0 ? 
      activeCitations.reduce((sum, m) => sum + (m.reviews.averageRating * m.reviews.count), 0) / totalReviews : 0;

    const averageDA = activeCitations.length > 0 ?
      activeCitations.reduce((sum, m) => sum + (m.domainAuthority || 0), 0) / activeCitations.length : 0;

    const napScore = citationManager.calculateNAPConsistency();

    const topPerforming = activeCitations
      .filter(m => m.traffic.monthly > 50 || (m.domainAuthority || 0) > 70)
      .sort((a, b) => b.traffic.monthly - a.traffic.monthly)
      .slice(0, 5)
      .map(m => m.directoryName);

    const underperforming = activeCitations
      .filter(m => m.traffic.monthly < 10 && (m.domainAuthority || 0) > 50)
      .map(m => m.directoryName);

    const audit = citationManager.generateCitationAudit();

    return {
      reportDate: new Date(),
      totalCitations: this.metrics.length,
      activeCitations: activeCitations.length,
      napConsistencyScore: napScore,
      averageDomainAuthority: Math.round(averageDA),
      totalTraffic,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      topPerformingDirectories: topPerforming,
      underperformingDirectories: underperforming,
      recommendedActions: audit.recommendedActions,
      monthlyTrends: {
        newCitations: 3, // Mock data - would track actual changes
        trafficGrowth: 15.2,
        reviewGrowth: 8.5,
        rankingImprovement: 12.3
      }
    };
  }

  /**
   * Get directory submission status summary
   */
  getSubmissionSummary(): {
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    needsUpdate: number;
    highPriority: number;
    estimatedCompletionTime: number;
  } {
    const stats = citationManager.getSubmissionStats();
    const pendingTasks = this.getMaintenanceTasks();
    const estimatedTime = pendingTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

    return {
      pending: stats.pending,
      submitted: stats.submitted,
      approved: stats.approved,
      rejected: stats.rejected,
      needsUpdate: stats.needsUpdate,
      highPriority: this.getMaintenanceTasks('HIGH').length,
      estimatedCompletionTime: estimatedTime
    };
  }

  /**
   * Monitor citation health score
   */
  getCitationHealthScore(): {
    overallScore: number;
    factors: {
      napConsistency: { score: number; weight: number };
      directoryCount: { score: number; weight: number };
      domainAuthority: { score: number; weight: number };
      trafficGeneration: { score: number; weight: number };
      reviewManagement: { score: number; weight: number };
    };
    recommendations: string[];
  } {
    const napScore = citationManager.calculateNAPConsistency();
    const activeCitations = this.metrics.filter(m => m.status === 'APPROVED').length;
    const avgDA = this.metrics.reduce((sum, m) => sum + (m.domainAuthority || 0), 0) / this.metrics.length;
    const totalTraffic = this.metrics.reduce((sum, m) => sum + m.traffic.monthly, 0);
    const avgRating = this.metrics.reduce((sum, m) => sum + m.reviews.averageRating, 0) / this.metrics.length;

    const factors = {
      napConsistency: { score: Math.min(napScore, 100), weight: 30 },
      directoryCount: { score: Math.min((activeCitations / 20) * 100, 100), weight: 25 },
      domainAuthority: { score: Math.min((avgDA / 80) * 100, 100), weight: 20 },
      trafficGeneration: { score: Math.min((totalTraffic / 1000) * 100, 100), weight: 15 },
      reviewManagement: { score: Math.min((avgRating / 5) * 100, 100), weight: 10 }
    };

    const overallScore = Math.round(
      Object.values(factors).reduce((sum, factor) => 
        sum + (factor.score * factor.weight / 100), 0
      )
    );

    const recommendations = [];
    if (factors.napConsistency.score < 95) recommendations.push('Improve NAP consistency across all directories');
    if (factors.directoryCount.score < 50) recommendations.push('Submit to more high-authority directories');
    if (factors.domainAuthority.score < 70) recommendations.push('Focus on quality directories with higher DA scores');
    if (factors.trafficGeneration.score < 30) recommendations.push('Optimize directory listings for better visibility');
    if (factors.reviewManagement.score < 80) recommendations.push('Encourage more customer reviews and maintain ratings');

    return {
      overallScore,
      factors,
      recommendations
    };
  }
}

export const citationTracker = new CitationTracker(); 