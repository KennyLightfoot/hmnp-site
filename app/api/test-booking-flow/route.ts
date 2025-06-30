/**
 * 🧪 DIAGNOSTIC ENDPOINT: Comprehensive Booking Flow Test
 * 
 * This endpoint tests the entire booking system to determine if incomplete GHL integration
 * is the root cause of booking failures. It systematically tests each component to isolate
 * where the system works vs. where it depends on GHL integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIP';
  details: string;
  timing?: number;
  data?: any;
}

interface TestSuite {
  timestamp: string;
  tests: TestResult[];
  overall: 'PASS' | 'WARNING' | 'FAIL' | 'ERROR';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  diagnostics: {
    ghlIntegrationStatus: string;
    databaseConnectivity: string;
    apiEndpointsAccessible: string;
    mockDataAvailable: string;
  };
}

export async function POST(request: NextRequest) {
  const testSuite: TestSuite = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'PASS',
    summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 },
    diagnostics: {
      ghlIntegrationStatus: 'unknown',
      databaseConnectivity: 'unknown',
      apiEndpointsAccessible: 'unknown',
      mockDataAvailable: 'unknown'
    }
  };

  try {
    console.log('🧪 Starting comprehensive booking flow test...');

    // Test 1: Database Connectivity
    await runTest(testSuite, 'Database Connectivity', async () => {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      const timing = Date.now() - start;
      testSuite.diagnostics.databaseConnectivity = 'connected';
      return { status: 'PASS', details: `Database connected successfully (${timing}ms)`, timing };
    });

    // Test 2: Services API
    await runTest(testSuite, 'Services API Endpoint', async () => {
      const start = Date.now();
      const baseUrl = getBaseUrl(request);
      const response = await fetch(`${baseUrl}/api/services-compatible`);
      const timing = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const hasServices = data.services?.all?.length > 0;
      
      if (!hasServices) {
        return { status: 'FAIL', details: 'No services returned from API', timing };
      }
      
      testSuite.diagnostics.mockDataAvailable = data._source === 'MOCK_DATA' ? 'mock_fallback' : 'database';
      
      return { 
        status: 'PASS', 
        details: `Services loaded successfully (${data.services.all.length} services, source: ${data._source || 'database'})`, 
        timing,
        data: { serviceCount: data.services.all.length, source: data._source }
      };
    });

    // Test 3: Availability API
    await runTest(testSuite, 'Availability API Endpoint', async () => {
      const start = Date.now();
      const baseUrl = getBaseUrl(request);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      const response = await fetch(`${baseUrl}/api/availability-compatible?date=${dateStr}&serviceId=standard-notary`);
      const timing = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const hasSlots = data.availableSlots?.length > 0;
      
      if (!hasSlots) {
        return { status: 'WARNING', details: 'No available time slots found', timing };
      }
      
      const availableSlots = data.availableSlots.filter((slot: any) => slot.available).length;
      
      return { 
        status: 'PASS', 
        details: `Availability loaded (${availableSlots}/${data.availableSlots.length} slots available, source: ${data._source || 'database'})`, 
        timing,
        data: { totalSlots: data.availableSlots.length, availableSlots, source: data._source }
      };
    });

    // Test 4: Booking Data Validation
    await runTest(testSuite, 'Booking Data Validation', async () => {
      const mockBookingData = {
        serviceId: 'standard-notary',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '5551234567',
        addressStreet: '123 Test St',
        addressCity: 'Houston',
        addressState: 'TX',
        addressZip: '77001',
        scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: 'CLIENT_SPECIFIED_ADDRESS',
        locationNotes: '',
        notes: 'Test booking for diagnostic purposes'
      };
      
      const validationResults = validateBookingData(mockBookingData);
      
      if (!validationResults.valid) {
        return { 
          status: 'FAIL', 
          details: `Validation failed: ${validationResults.errors.join(', ')}`,
          data: { errors: validationResults.errors }
        };
      }
      
      return { 
        status: 'PASS', 
        details: 'Booking data structure validation passed',
        data: { fields: Object.keys(mockBookingData).length }
      };
    });

    // Test 5: GHL Integration Status
    await runTest(testSuite, 'GHL Integration Status', async () => {
      const ghlStatus = await checkGHLIntegration();
      testSuite.diagnostics.ghlIntegrationStatus = ghlStatus.connected ? 'connected' : 'incomplete';
      
      return {
        status: ghlStatus.connected ? 'PASS' : 'WARNING',
        details: ghlStatus.message,
        data: { 
          hasApiKey: !!process.env.GHL_API_KEY,
          hasLocationId: !!process.env.GHL_LOCATION_ID,
          setupMode: process.env.GHL_SETUP_MODE === 'true'
        }
      };
    });

    // Test 6: Database Services Check
    await runTest(testSuite, 'Database Services Check', async () => {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, name: true, basePrice: true, serviceType: true }
      });
      
      if (services.length === 0) {
        return { 
          status: 'WARNING', 
          details: 'No active services in database - system will use mock data',
          data: { serviceCount: 0 }
        };
      }
      
      return { 
        status: 'PASS', 
        details: `Found ${services.length} active services in database`,
        data: { serviceCount: services.length, services: services.slice(0, 3) }
      };
    });

    // Test 7: Mock vs Real Data Test
    await runTest(testSuite, 'Data Source Analysis', async () => {
      // Check if system is running on mock data or real data
      const mockIndicators = {
        servicesFromMock: testSuite.tests.find(t => t.name === 'Services API Endpoint')?.data?.source === 'MOCK_DATA',
        availabilityFromMock: testSuite.tests.find(t => t.name === 'Availability API Endpoint')?.data?.source === 'MOCK_DATA',
        ghlSetupMode: process.env.GHL_SETUP_MODE === 'true',
        missingGhlCredentials: !process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID
      };
      
      const mockCount = Object.values(mockIndicators).filter(Boolean).length;
      
      if (mockCount > 2) {
        return {
          status: 'WARNING',
          details: `System running primarily on mock data (${mockCount}/4 indicators)`,
          data: mockIndicators
        };
      } else if (mockCount > 0) {
        return {
          status: 'WARNING',
          details: `System partially using mock data (${mockCount}/4 indicators)`,
          data: mockIndicators
        };
      } else {
        return {
          status: 'PASS',
          details: 'System running on real data',
          data: mockIndicators
        };
      }
    });

    // Test 8: Service Worker and Request Patterns
    await runTest(testSuite, 'Request Pattern Analysis', async () => {
      // This test just provides guidance for manual verification
      return {
        status: 'PASS',
        details: 'Request pattern analysis available - check browser network tab',
        data: {
          guidance: [
            'Open browser dev tools → Network tab',
            'Load booking page and check for repeated requests',
            'Look for 404 errors on /api/services-compatible',
            'Verify service worker is not causing loops'
          ]
        }
      };
    });

    // Calculate summary
    testSuite.summary.total = testSuite.tests.length;
    testSuite.summary.passed = testSuite.tests.filter(t => t.status === 'PASS').length;
    testSuite.summary.failed = testSuite.tests.filter(t => t.status === 'FAIL').length;
    testSuite.summary.warnings = testSuite.tests.filter(t => t.status === 'WARNING').length;
    testSuite.summary.skipped = testSuite.tests.filter(t => t.status === 'SKIP').length;

    // Determine overall status
    if (testSuite.summary.failed > 0) {
      testSuite.overall = 'FAIL';
    } else if (testSuite.summary.warnings > 0) {
      testSuite.overall = 'WARNING';
    } else {
      testSuite.overall = 'PASS';
    }

    testSuite.diagnostics.apiEndpointsAccessible = testSuite.summary.failed === 0 ? 'accessible' : 'some_failures';

    console.log('🧪 Booking flow test completed:', {
      overall: testSuite.overall,
      summary: testSuite.summary,
      diagnostics: testSuite.diagnostics
    });

    return NextResponse.json(testSuite);

  } catch (error) {
    console.error('🧪 Booking flow test failed:', error);
    
    testSuite.overall = 'ERROR';
    testSuite.tests.push({
      name: 'Test Execution Error',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });

    return NextResponse.json(testSuite, { status: 500 });
  }
}

async function runTest(testSuite: TestSuite, name: string, testFn: () => Promise<Partial<TestResult>>) {
  try {
    console.log(`🧪 Running test: ${name}`);
    const result = await testFn();
    
    testSuite.tests.push({
      name,
      status: result.status || 'PASS',
      details: result.details || 'Test completed',
      timing: result.timing,
      data: result.data
    });
  } catch (error) {
    console.error(`🧪 Test failed: ${name}`, error);
    testSuite.tests.push({
      name,
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Test execution failed'
    });
  }
}

function validateBookingData(data: any) {
  const errors = [];
  
  if (!data.serviceId) errors.push('Missing service ID');
  if (!data.customerName) errors.push('Missing customer name');
  if (!data.customerEmail) errors.push('Missing customer email');
  if (!data.customerPhone) errors.push('Missing customer phone');
  if (!data.scheduledDateTime) errors.push('Missing scheduled date/time');
  if (!data.locationType) errors.push('Missing location type');
  if (!data.addressStreet) errors.push('Missing address street');
  if (!data.addressCity) errors.push('Missing address city');
  if (!data.addressState) errors.push('Missing address state');
  if (!data.addressZip) errors.push('Missing address ZIP');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function checkGHLIntegration() {
  const hasApiKey = !!process.env.GHL_API_KEY;
  const hasLocationId = !!process.env.GHL_LOCATION_ID;
  const setupMode = process.env.GHL_SETUP_MODE === 'true';
  
  if (setupMode) {
    return {
      connected: false,
      message: 'GHL Setup Mode enabled - integration disabled for testing'
    };
  }
  
  if (!hasApiKey || !hasLocationId) {
    return {
      connected: false,
      message: 'GHL environment variables not configured (missing API key or Location ID)'
    };
  }

  try {
    // TODO: Test actual GHL API connection when ready
    // For now, return incomplete status since we're in diagnostic mode
    return {
      connected: false,
      message: 'GHL credentials present but integration incomplete - mock mode active'
    };
  } catch (error) {
    return {
      connected: false,
      message: `GHL connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export async function GET() {
  return NextResponse.json({
    message: 'Booking Flow Test Endpoint',
    description: 'POST to this endpoint to run comprehensive booking system diagnostics',
    usage: 'curl -X POST /api/test-booking-flow',
    timestamp: new Date().toISOString()
  });
}