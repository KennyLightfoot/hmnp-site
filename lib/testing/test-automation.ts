/**
 * Test Automation System
 * Provides automated testing for API endpoints, integrations, and performance
 */

import { logger } from '../logger';
import { cache } from '../cache';
import { prisma } from '../prisma';
import * as ghl from '../ghl/api';

export interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  overallStatus: 'PASSED' | 'FAILED' | 'PARTIAL';
  totalDuration: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
}

class TestAutomation {
  private testResults: TestResult[] = [];

  /**
   * Run comprehensive API tests
   */
  async runAPITests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'API Tests',
      tests: [],
      overallStatus: 'PASSED',
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0,
      skippedCount: 0
    };

    const tests = [
      () => this.testHealthEndpoint(),
      () => this.testBookingCreation(),
      () => this.testPaymentProcessing(),
      () => this.testWebhookSecurity(),
      () => this.testCachePerformance(),
      () => this.testDatabaseConnections(),
      () => this.testGHLIntegration(),
      () => this.testAuthenticationFlow()
    ];

    for (const test of tests) {
      try {
        const result = await test();
        suite.tests.push(result);
        suite.totalDuration += result.duration;

        if (result.status === 'PASSED') {
          suite.passedCount++;
        } else if (result.status === 'FAILED') {
          suite.failedCount++;
          suite.overallStatus = 'FAILED';
        } else {
          suite.skippedCount++;
          if (suite.overallStatus === 'PASSED') {
            suite.overallStatus = 'PARTIAL';
          }
        }
      } catch (error) {
        const failedResult: TestResult = {
          testName: 'Unknown Test',
          status: 'FAILED',
          duration: 0,
          error: (error as Error).message,
          timestamp: new Date()
        };
        suite.tests.push(failedResult);
        suite.failedCount++;
        suite.overallStatus = 'FAILED';
      }
    }

    logger.info('API test suite completed', 'TESTING', {
      suite: suite.suiteName,
      status: suite.overallStatus,
      passed: suite.passedCount,
      failed: suite.failedCount,
      duration: suite.totalDuration
    });

    return suite;
  }

  /**
   * Test health endpoint
   */
  private async testHealthEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.status || data.status !== 'healthy') {
        throw new Error('Health check returned unhealthy status');
      }

      return {
        testName: 'Health Endpoint',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { responseTime: data.responseTime },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Health Endpoint',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test booking creation flow
   */
  private async testBookingCreation(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Create test booking data
      const testBookingData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        customerPhone: '555-0123',
        serviceName: 'Essential Notary Service',
        scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        addressStreet: '123 Test St',
        addressCity: 'Houston',
        addressState: 'TX',
        notes: 'Automated test booking'
      };

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/bookings/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERNAL_API_KEY || ''
        },
        body: JSON.stringify(testBookingData)
      });

      if (!response.ok) {
        throw new Error(`Booking creation failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data.bookingId) {
        throw new Error('Booking creation response invalid');
      }

      // Clean up test booking
      await this.cleanupTestBooking(data.data.bookingId);

      return {
        testName: 'Booking Creation',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { bookingId: data.data.bookingId },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Booking Creation',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test payment processing
   */
  private async testPaymentProcessing(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 7500, // $75.00
          bookingId: 'test-booking-id',
          customerEmail: 'test@example.com'
        })
      });

      if (!response.ok) {
        throw new Error(`Payment intent creation failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error('Payment intent response missing clientSecret');
      }

      return {
        testName: 'Payment Processing',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { hasClientSecret: !!data.clientSecret },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Payment Processing',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test webhook security
   */
  private async testWebhookSecurity(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test webhook without signature (should fail)
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      // Should return 401 or 400 for missing signature
      if (response.status !== 401 && response.status !== 400) {
        throw new Error(`Webhook security test failed - expected 401/400, got ${response.status}`);
      }

      return {
        testName: 'Webhook Security',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { securityStatus: 'protected' },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Webhook Security',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test cache performance
   */
  private async testCachePerformance(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testKey = `test:cache:${Date.now()}`;
      const testData = { message: 'test data', timestamp: new Date() };

      // Test cache set
      const setResult = await cache.set(testKey, testData, { ttl: 300 });
      if (!setResult) {
        throw new Error('Cache set operation failed');
      }

      // Test cache get
      const getData = await cache.get(testKey);
      if (!getData || getData.message !== testData.message) {
        throw new Error('Cache get operation failed');
      }

      // Test cache delete
      const deleteResult = await cache.delete(testKey);
      if (!deleteResult) {
        throw new Error('Cache delete operation failed');
      }

      // Test cache health
      const healthCheck = await cache.healthCheck();
      if (healthCheck.status !== 'healthy') {
        throw new Error(`Cache health check failed: ${healthCheck.error}`);
      }

      return {
        testName: 'Cache Performance',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { 
          latency: healthCheck.latency,
          operations: ['set', 'get', 'delete']
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Cache Performance',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test database connections
   */
  private async testDatabaseConnections(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      await prisma.$queryRaw`SELECT 1 as test`;

      // Test read operation
      const serviceCount = await prisma.service.count();
      if (typeof serviceCount !== 'number') {
        throw new Error('Database read test failed');
      }

      // Test connection info
      const connectionInfo = await prisma.$queryRaw`
        SELECT 
          current_database() as database,
          current_user as user,
          version() as version
      ` as any[];

      return {
        testName: 'Database Connections',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { 
          serviceCount,
          database: connectionInfo[0]?.database,
          responseTime: Date.now() - startTime
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Database Connections',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test GHL integration
   */
  private async testGHLIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
        return {
          testName: 'GHL Integration',
          status: 'SKIPPED',
          duration: Date.now() - startTime,
          error: 'GHL Private Integration Token not configured',
          timestamp: new Date()
        };
      }

      // Test GHL API connectivity (safe read-only operation)
      const testEmail = 'nonexistent@test.com';
      const contact = await ghl.findContactByEmail(testEmail);
      
      // Should return null for non-existent contact (this is expected)
      if (contact !== null) {
        logger.warn('Unexpected contact found in GHL test', 'TESTING', { email: testEmail });
      }

      return {
        testName: 'GHL Integration',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { 
          contactFound: contact !== null,
          apiResponsive: true
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'GHL Integration',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Test authentication flow
   */
  private async testAuthenticationFlow(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test protected endpoint without auth (should fail)
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/protected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Should return 401 for unauthenticated request
      if (response.status !== 401) {
        throw new Error(`Auth test failed - expected 401, got ${response.status}`);
      }

      return {
        testName: 'Authentication Flow',
        status: 'PASSED',
        duration: Date.now() - startTime,
        metadata: { authProtected: true },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Authentication Flow',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Performance load testing
   */
  async runLoadTests(concurrency = 10, duration = 30000): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Load Tests',
      tests: [],
      overallStatus: 'PASSED',
      totalDuration: duration,
      passedCount: 0,
      failedCount: 0,
      skippedCount: 0
    };

    const startTime = Date.now();
    const endTime = startTime + duration;
    const promises: Promise<TestResult>[] = [];

    // Spawn concurrent requests
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.runConcurrentRequests(endTime, i));
    }

    const results = await Promise.all(promises);
    suite.tests = results;

    // Calculate statistics
    results.forEach(result => {
      if (result.status === 'PASSED') {
        suite.passedCount++;
      } else if (result.status === 'FAILED') {
        suite.failedCount++;
        suite.overallStatus = 'FAILED';
      } else {
        suite.skippedCount++;
      }
    });

    return suite;
  }

  private async runConcurrentRequests(endTime: number, workerId: number): Promise<TestResult> {
    const startTime = Date.now();
    let requestCount = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      while (Date.now() < endTime) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/health`);
          requestCount++;
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }

          // Small delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          requestCount++;
        }
      }

      const successRate = requestCount > 0 ? (successCount / requestCount) * 100 : 0;
      const status = successRate >= 95 ? 'PASSED' : 'FAILED';

      return {
        testName: `Load Test Worker ${workerId}`,
        status,
        duration: Date.now() - startTime,
        metadata: {
          requestCount,
          successCount,
          errorCount,
          successRate: successRate.toFixed(2)
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: `Load Test Worker ${workerId}`,
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Clean up test data
   */
  private async cleanupTestBooking(bookingId: string): Promise<void> {
    try {
      await prisma.booking.delete({
        where: { id: bookingId }
      });
    } catch (error) {
      logger.warn('Failed to cleanup test booking', 'TESTING', { bookingId, error: (error as Error).message });
    }
  }

  /**
   * Get test summary
   */
  getTestSummary(): {
    totalTests: number;
    recentPassed: number;
    recentFailed: number;
    lastRunTime: Date | null;
  } {
    const recentTests = this.testResults.filter(
      test => test.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      totalTests: this.testResults.length,
      recentPassed: recentTests.filter(t => t.status === 'PASSED').length,
      recentFailed: recentTests.filter(t => t.status === 'FAILED').length,
      lastRunTime: this.testResults.length > 0 ? this.testResults[this.testResults.length - 1].timestamp : null
    };
  }
}

export const testAutomation = new TestAutomation(); 