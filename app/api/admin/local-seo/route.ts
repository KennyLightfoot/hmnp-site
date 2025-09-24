/**
 * 🎯 Local SEO Admin API - Phase 5 Enhancement
 * Houston Mobile Notary Pros - Local SEO Management & Citation Tracking
 * 
 * Admin endpoints for NAP auditing, citation management, and local SEO analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { napAuditService } from '@/lib/seo/nap-audit-service';
import { citationDiscoveryService } from '@/lib/seo/citation-discovery-service';
import { directoryAutomationService } from '@/lib/seo/directory-automation-service';

// Check admin authentication
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!authHeader || !adminApiKey) {
    return false;
  }
  
  return authHeader === `Bearer ${adminApiKey}`;
}

/**
 * GET /api/admin/local-seo - Get local SEO dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'dashboard':
        return await getDashboardData();
      case 'citations':
        return await getCitationData();
      case 'audit':
        return await getAuditData();
      case 'directories':
        return await getDirectoryData();
      default:
        return await getDashboardData();
    }

  } catch (error) {
    console.error('❌ Local SEO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/local-seo - Execute local SEO actions
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'run_nap_audit':
        return await runNAPAudit();
      case 'discover_citations':
        return await discoverCitations();
      case 'submit_directories':
        return await submitToDirectories(params);
      case 'update_citation':
        return await updateCitation(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Local SEO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get dashboard data
 */
async function getDashboardData() {
  try {
    console.log('📊 Fetching local SEO dashboard data...');

    // Get business data
    const businessData = napAuditService.getStandardBusinessData();
    
    // Mock dashboard data - in real implementation, this would fetch from database
    const dashboardData = {
      businessInfo: {
        name: businessData.name,
        address: businessData.address,
        phone: businessData.phone,
        website: businessData.website,
        serviceAreas: businessData.serviceAreas
      },
      citationHealth: {
        totalCitations: 47,
        verifiedCitations: 38,
        claimedCitations: 42,
        consistentCitations: 44,
        averageConsistencyScore: 94,
        platformDistribution: {
          major: 8,
          local: 24,
          niche: 12,
          social: 3
        },
        recentChanges: {
          newCitations: 5,
          updatedCitations: 3,
          removedCitations: 1
        }
      },
      localMetrics: {
        localSearchClicks: 1247,
        localSearchViews: 8935,
        localCTR: 13.95,
        averageRating: 4.8,
        totalReviews: 156,
        newReviews: 12,
        directorySubmissions: 23,
        approvedSubmissions: 18,
        pendingSubmissions: 5
      },
      topPlatforms: [
        {
          name: 'Google My Business',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 100,
          importance: 'high'
        },
        {
          name: 'Yelp',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 95,
          importance: 'high'
        },
        {
          name: 'Facebook',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 90,
          importance: 'high'
        },
        {
          name: 'Yellow Pages',
          citations: 1,
          verified: false,
          claimed: true,
          consistency: 85,
          importance: 'medium'
        },
        {
          name: '123Notary',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 98,
          importance: 'high'
        }
      ],
      inconsistencies: [
        {
          platform: 'Yellow Pages',
          field: 'phone',
          currentValue: '(713) 364-4066',
          standardValue: '(713) 364-4065',
          severity: 'high',
          impact: 'Confuses customers and search engines'
        },
        {
          platform: 'Superpages',
          field: 'website',
          currentValue: 'http://houstonmobilenotarypros.com',
          standardValue: 'https://houstonmobilenotarypros.com',
          severity: 'medium',
          impact: 'Reduces website traffic and SEO value'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Get citation data
 */
async function getCitationData() {
  try {
    console.log('📋 Fetching citation data...');

    // Mock citation data
    const citationData = {
      citations: [
        {
          id: 'gmb-1',
          platform: 'Google My Business',
          businessName: 'Houston Mobile Notary Pros',
          phone: '(713) 364-4065',
          website: 'https://houstonmobilenotarypros.com',
          address: {
            city: 'Houston',
            state: 'TX',
            zipCode: '77591'
          },
          verified: true,
          claimed: true,
          consistency: 100,
          rating: 4.8,
          reviewCount: 127,
          status: 'active',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'yelp-1',
          platform: 'Yelp',
          businessName: 'Houston Mobile Notary Pros',
          phone: '(713) 364-4065',
          website: 'https://houstonmobilenotarypros.com',
          address: {
            city: 'Houston',
            state: 'TX',
            zipCode: '77591'
          },
          verified: true,
          claimed: true,
          consistency: 95,
          rating: 4.7,
          reviewCount: 89,
          status: 'active',
          lastUpdated: new Date().toISOString()
        }
      ],
      summary: {
        totalCitations: 47,
        verifiedCitations: 38,
        claimedCitations: 42,
        averageConsistency: 94
      }
    };

    return NextResponse.json({
      success: true,
      data: citationData
    });

  } catch (error) {
    console.error('❌ Error fetching citation data:', error);
    throw error;
  }
}

/**
 * Get audit data
 */
async function getAuditData() {
  try {
    console.log('🔍 Fetching audit data...');

    // Mock audit history
    const auditData = {
      recentAudits: [
        {
          id: 'audit-1',
          date: new Date().toISOString(),
          type: 'full_audit',
          consistencyScore: 94,
          citationsChecked: 47,
          inconsistenciesFound: 3,
          status: 'completed'
        },
        {
          id: 'audit-2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'partial_audit',
          consistencyScore: 92,
          citationsChecked: 25,
          inconsistenciesFound: 5,
          status: 'completed'
        }
      ],
      nextScheduledAudit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      auditSettings: {
        frequency: 'weekly',
        notifications: true,
        autoFix: false
      }
    };

    return NextResponse.json({
      success: true,
      data: auditData
    });

  } catch (error) {
    console.error('❌ Error fetching audit data:', error);
    throw error;
  }
}

/**
 * Get directory data
 */
async function getDirectoryData() {
  try {
    console.log('🚀 Fetching directory data...');

    const directoryTargets = directoryAutomationService.getDirectoryTargets();
    
    const directoryData = {
      availableDirectories: directoryTargets.map(target => ({
        id: target.id,
        name: target.name,
        category: target.category,
        importance: target.importance,
        domainAuthority: target.domainAuthority,
        cost: target.cost,
        isActive: target.isActive,
        estimatedProcessingTime: target.estimatedProcessingTime,
        requiresVerification: target.requiresVerification
      })),
      recentSubmissions: [
        {
          id: 'sub-1',
          directoryName: 'Yellow Pages',
          status: 'approved',
          submissionDate: new Date().toISOString(),
          approvalDate: new Date().toISOString()
        },
        {
          id: 'sub-2',
          directoryName: 'Superpages',
          status: 'pending',
          submissionDate: new Date().toISOString(),
          approvalDate: null
        }
      ],
      submissionStats: {
        totalSubmissions: 23,
        approvedSubmissions: 18,
        pendingSubmissions: 5,
        rejectedSubmissions: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: directoryData
    });

  } catch (error) {
    console.error('❌ Error fetching directory data:', error);
    throw error;
  }
}

/**
 * Run NAP audit
 */
async function runNAPAudit() {
  try {
    console.log('🔍 Running NAP audit...');

    const auditResult = await napAuditService.auditNAPConsistency();

    return NextResponse.json({
      success: true,
      message: 'NAP audit completed successfully',
      data: auditResult
    });

  } catch (error) {
    console.error('❌ Error running NAP audit:', error);
    return NextResponse.json(
      { error: 'Failed to run NAP audit' },
      { status: 500 }
    );
  }
}

/**
 * Discover citations
 */
async function discoverCitations() {
  try {
    console.log('🔍 Discovering citations...');

    const discoveryResult = await citationDiscoveryService.discoverCitations();

    return NextResponse.json({
      success: true,
      message: 'Citation discovery completed successfully',
      data: discoveryResult
    });

  } catch (error) {
    console.error('❌ Error discovering citations:', error);
    return NextResponse.json(
      { error: 'Failed to discover citations' },
      { status: 500 }
    );
  }
}

/**
 * Submit to directories
 */
async function submitToDirectories(params: any) {
  try {
    console.log('🚀 Submitting to directories...');

    const submissionResult = await directoryAutomationService.submitToAllDirectories();

    return NextResponse.json({
      success: true,
      message: 'Directory submissions completed successfully',
      data: submissionResult
    });

  } catch (error) {
    console.error('❌ Error submitting to directories:', error);
    return NextResponse.json(
      { error: 'Failed to submit to directories' },
      { status: 500 }
    );
  }
}

/**
 * Update citation
 */
async function updateCitation(params: any) {
  try {
    console.log('📝 Updating citation...');

    const { citationId, updates } = params;

    if (!citationId || !updates) {
      return NextResponse.json(
        { error: 'Citation ID and updates are required' },
        { status: 400 }
      );
    }

    // Mock update - in real implementation, this would update the database
    const updatedCitation = {
      id: citationId,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Citation updated successfully',
      data: updatedCitation
    });

  } catch (error) {
    console.error('❌ Error updating citation:', error);
    return NextResponse.json(
      { error: 'Failed to update citation' },
      { status: 500 }
    );
  }
} 