/**
 * System Test API Endpoint
 * Provides access to comprehensive system testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { runSystemTests, runQuickHealthCheck, exportTestReport } from '@/lib/testing/system-tests';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';

/**
 * GET - Run system tests or health check
 */
export const GET = withAdminSecurity(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'health';
  const export_report = searchParams.get('export') === 'true';

  try {
    if (testType === 'full') {
      console.log('🧪 Running comprehensive system tests...');
      const report = await runSystemTests();
      
      if (export_report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = `/tmp/system-test-report-${timestamp}.json`;
        await exportTestReport(report, filePath);
        
        return NextResponse.json({
          ...report,
          exportPath: filePath
        });
      }
      
      return NextResponse.json(report);
      
    } else if (testType === 'health') {
      console.log('🩺 Running quick health check...');
      const healthCheck = await runQuickHealthCheck();
      
      return NextResponse.json({
        ...healthCheck,
        timestamp: new Date().toISOString(),
        testType: 'health'
      });
      
    } else {
      return NextResponse.json({
        error: 'Invalid test type',
        validTypes: ['health', 'full']
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('System test execution failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'System test execution failed',
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});

/**
 * POST - Run specific test categories
 */
export const POST = withAdminSecurity(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { categories, config } = body;
    
    if (!Array.isArray(categories)) {
      return NextResponse.json({
        error: 'Categories must be an array',
        validCategories: ['database', 'cache', 'api', 'security', 'performance', 'integration']
      }, { status: 400 });
    }
    
    // For now, run full tests (could be enhanced to run specific categories)
    const report = await runSystemTests();
    
    // Filter results by categories if specified
    const filteredResults = categories.length > 0 
      ? report.results.filter(result => 
          categories.some(cat => result.name.toLowerCase().includes(cat.toLowerCase()))
        )
      : report.results;
    
    const filteredReport = {
      ...report,
      results: filteredResults,
      totalTests: filteredResults.length,
      passed: filteredResults.filter(r => r.status === 'PASS').length,
      failed: filteredResults.filter(r => r.status === 'FAIL').length,
      warnings: filteredResults.filter(r => r.status === 'WARN').length,
      categories,
      config
    };
    
    return NextResponse.json(filteredReport);
    
  } catch (error) {
    console.error('Custom system test execution failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Custom system test execution failed',
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});
