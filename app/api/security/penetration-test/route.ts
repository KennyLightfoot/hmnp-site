/**
 * Penetration Testing API Endpoint
 * Provides access to security testing and vulnerability management
 */

import { NextRequest, NextResponse } from 'next/server';
import { penetrationTestingService } from '@/lib/security/penetration-testing';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';

/**
 * GET - Get vulnerability reports or run scans
 */
export const GET = withAdminSecurity(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const reportId = searchParams.get('reportId');

  try {
    switch (action) {
      case 'list':
        const reports = await penetrationTestingService.getAllVulnerabilityReports();
        return NextResponse.json({
          success: true,
          reports,
          count: reports.length
        });

      case 'get':
        if (!reportId) {
          return NextResponse.json({
            success: false,
            error: 'Report ID is required'
          }, { status: 400 });
        }
        
        const report = await penetrationTestingService.getVulnerabilityReport(reportId);
        if (!report) {
          return NextResponse.json({
            success: false,
            error: 'Report not found'
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          report
        });

      case 'run-owasp':
        const target = searchParams.get('target') || process.env.NEXT_PUBLIC_APP_URL;
        if (!target) {
          return NextResponse.json({
            success: false,
            error: 'Target URL is required'
          }, { status: 400 });
        }
        
        const owaspReport = await penetrationTestingService.runOwaspZapScan(target);
        return NextResponse.json({
          success: true,
          message: 'OWASP ZAP scan completed',
          report: owaspReport
        });

      case 'run-dependency-check':
        const depReport = await penetrationTestingService.runDependencyCheck();
        return NextResponse.json({
          success: true,
          message: 'Dependency check completed',
          report: depReport
        });

      case 'run-comprehensive':
        const comprehensiveReports = await penetrationTestingService.runComprehensiveAudit();
        return NextResponse.json({
          success: true,
          message: 'Comprehensive security audit completed',
          reports: comprehensiveReports,
          count: comprehensiveReports.length
        });

      case 'schedule-quarterly':
        const schedule = await penetrationTestingService.scheduleQuarterlyTests();
        return NextResponse.json({
          success: true,
          message: 'Quarterly penetration tests scheduled',
          schedule
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['list', 'get', 'run-owasp', 'run-dependency-check', 'run-comprehensive', 'schedule-quarterly']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Penetration testing API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Security testing failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});

/**
 * POST - Update vulnerability status
 */
export const POST = withAdminSecurity(async (request: NextRequest) => {
  try {
    const { reportId, vulnerabilityId, status, resolution } = await request.json();

    if (!reportId || !vulnerabilityId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: reportId, vulnerabilityId, status'
      }, { status: 400 });
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status',
        validStatuses
      }, { status: 400 });
    }

    await penetrationTestingService.updateVulnerabilityStatus(
      reportId,
      vulnerabilityId,
      status,
      resolution
    );

    return NextResponse.json({
      success: true,
      message: 'Vulnerability status updated successfully'
    });
  } catch (error) {
    console.error('Vulnerability update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update vulnerability status',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}); 