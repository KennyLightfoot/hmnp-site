/**
 * Test Automation System
 */

import { logger } from './logger';
import { cache } from './cache';
import { prisma } from './prisma';

export interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  error?: string;
  timestamp: Date;
}

class TestRunner {
  async runHealthTests(): Promise<TestResult[]> {
    const tests = [
      () => this.testDatabase(),
      () => this.testCache(),
      () => this.testAPIEndpoint()
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
      } catch (error) {
        results.push({
          testName: 'Unknown Test',
          status: 'FAILED',
          duration: 0,
          error: (error as Error).message,
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  private async testDatabase(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      
      return {
        testName: 'Database Connection',
        status: 'PASSED',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Database Connection',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  private async testCache(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testKey = `test:${Date.now()}`;
      const testData = { test: true };

      const setResult = await cache.set(testKey, testData, { ttl: 60 });
      if (!setResult) {
        throw new Error('Cache set failed');
      }

      const getData = await cache.get(testKey);
      if (!getData || !getData.test) {
        throw new Error('Cache get failed');
      }

      await cache.delete(testKey);

      return {
        testName: 'Cache Operations',
        status: 'PASSED',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Cache Operations',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  private async testAPIEndpoint(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/health`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      return {
        testName: 'API Health Endpoint',
        status: 'PASSED',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'API Health Endpoint',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }

  async runPerformanceTest(duration = 10000): Promise<TestResult> {
    const startTime = Date.now();
    let requestCount = 0;
    let successCount = 0;

    try {
      const endTime = startTime + duration;

      while (Date.now() < endTime) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/health`);
          requestCount++;
          
          if (response.ok) {
            successCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          requestCount++;
        }
      }

      const successRate = (successCount / requestCount) * 100;
      const status = successRate >= 95 ? 'PASSED' : 'FAILED';

      return {
        testName: 'Performance Test',
        status,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Performance Test',
        status: 'FAILED',
        duration: Date.now() - startTime,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }
}

export const testRunner = new TestRunner(); 