/**
 * Test Environment Setup
 * Houston Mobile Notary Pros
 * 
 * Configures test environment, database connections, and Docker containers
 * Used by Vitest for integration tests
 */

import { vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { exec, spawn, ChildProcess } from 'child_process';
import fs from 'node:fs';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';

const execAsync = promisify(exec);

// Only set environment variables in test/development environments
if (process.env.NODE_ENV !== 'production') {
  // Set environment variables required by modules during import
  process.env.S3_BUCKET_NAME = 'mock-bucket';
  process.env.AWS_REGION = 'mock-region';

  // Load test environment variables
  dotenv.config({ path: path.join(__dirname, '.env.test') });

  // Test database configuration
  const TEST_DB_URL = process.env.TEST_DATABASE_URL || 
    'postgresql://hmnp_test:test_password_2024@localhost:5433/hmnp_test_db';
  const TEST_REDIS_URL = process.env.TEST_REDIS_URL || 
    'redis://localhost:6380';

  // Set test environment URLs
  process.env.DATABASE_URL = TEST_DB_URL;
  process.env.REDIS_URL = TEST_REDIS_URL;
}

/**
 * Check if Docker is available and running
 */
async function checkDockerAvailable(): Promise<boolean> {
  try {
    await execAsync('docker --version');
    // Prefer modern Docker Compose v2; fall back to v1 if needed
    try {
      await execAsync('docker compose version');
    } catch {
      await execAsync('docker-compose --version');
    }
    return true;
  } catch {
    console.warn('⚠️ Docker not available - using local test services');
    return false;
  }
}

/**
 * Start Docker test services
 */
async function startDockerServices(): Promise<void> {
  const isDockerAvailable = await checkDockerAvailable();
  if (!isDockerAvailable) {
    console.warn('⚠️ Skipping Docker services - not available');
    return;
  }

  console.log('🐳 Starting Docker test services...');
  
  try {
    // Start services in background
    // Ensure a clean state first to avoid rename/container conflicts
    try {
      await execAsync('docker compose -f tests/docker-compose.yml down -v', {
        cwd: path.join(__dirname, '..')
      });
    } catch {
      // ignore
    }

    await execAsync('docker compose -f tests/docker-compose.yml up -d postgres-test redis-test', {
      cwd: path.join(__dirname, '..')
    });

    // Wait for services to be healthy (with retries)
    console.log('⏳ Waiting for services to be healthy...');
    
    let retries = 30;
    while (retries > 0) {
      try {
        await execAsync('docker compose -f tests/docker-compose.yml exec -T postgres-test pg_isready -U hmnp_test', {
          cwd: path.join(__dirname, '..')
        });
        break;
      } catch {
        retries--;
        if (retries === 0) throw new Error('PostgreSQL health check failed');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    retries = 10;
    while (retries > 0) {
      try {
        await execAsync('docker compose -f tests/docker-compose.yml exec -T redis-test redis-cli ping', {
          cwd: path.join(__dirname, '..')
        });
        break;
      } catch {
        retries--;
        if (retries === 0) throw new Error('Redis health check failed');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('✅ Docker services are ready');
  } catch (error) {
    console.error('❌ Failed to start Docker services:', error);
    // Don't throw - allow tests to run with mocked services
  }
}

/**
 * Stop Docker services
 */
async function stopDockerServices(): Promise<void> {
  try {
    console.log('🛑 Stopping Docker test services...');
    await execAsync('docker compose -f tests/docker-compose.yml down -v', {
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Docker services stopped');
  } catch (error) {
    console.warn('⚠️ Error stopping Docker services:', error);
  }
}

/**
 * Start Next.js dev server for integration tests and wait until health endpoint is ready
 */
let nextDevServer: ChildProcess | null = null;

async function waitForServerReady(baseUrl: string, timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health/status`);
      if (res.ok) return;
    } catch {
      // ignore until ready
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Next server did not become ready within ${timeoutMs}ms`);
}

async function startNextServer(): Promise<void> {
  if (nextDevServer) return;

  const PORT = process.env.PORT || '3000';
  const env = { ...process.env, PORT };

  // If a server already responds on the health endpoint, do not start another
  try {
    const res = await fetch(`http://localhost:${PORT}/api/health/status`);
    if (res.ok) {
      console.log(`ℹ️ Next server already running on port ${PORT}`);
      return;
    }
  } catch {
    // proceed to spawn
  }

  // Start Next dev server via pnpm
  nextDevServer = spawn('pnpm', ['dev'], {
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  nextDevServer.stdout?.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('ready - started server')) {
      // noop: still wait on health endpoint to ensure app readiness
    }
  });

  nextDevServer.stderr?.on('data', (data) => {
    // keep logs visible for debugging but do not throw
    console.error(`[next-dev]`, data.toString());
  });

  const baseUrl = `http://localhost:${PORT}`;
  await waitForServerReady(baseUrl);
}

async function stopNextServer(): Promise<void> {
  if (!nextDevServer) return;
  try {
    nextDevServer.kill();
  } catch {
    // ignore
  } finally {
    nextDevServer = null;
  }
}

// Global setup for integration tests only
// When global setup is used for integration, skip per-file environment bootstrapping
if (process.env.TEST_TYPE === 'integration' && !process.env.VITEST_GLOBAL_SETUP) {
  beforeAll(async () => {
    console.log('🚀 Setting up integration test environment...');
    await startDockerServices();
    await startNextServer();
    console.log('✅ Integration test environment ready');
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    console.log('🧹 Tearing down integration test environment...');
    await stopNextServer();
    await stopDockerServices();
    console.log('✅ Integration test environment cleaned up');
  }, 30000); // 30 second timeout for teardown
}

// Global setup for all tests
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Mock Prisma for unit tests
  if (process.env.TEST_TYPE !== 'integration') {
    vi.mock('@/lib/prisma', () => ({
      prisma: {
        booking: {
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn()
        },
        payment: {
          create: vi.fn(),
          findUnique: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn()
        },
        service: {
          findUnique: vi.fn(),
          findMany: vi.fn()
        },
        $connect: vi.fn(),
        $disconnect: vi.fn()
      }
    }));
  }

  // Mock Redis for unit tests
  if (process.env.TEST_TYPE !== 'integration') {
    vi.mock('@/lib/redis', () => ({
      redis: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue('OK'),
        setex: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
        exists: vi.fn().mockResolvedValue(0),
        flushdb: vi.fn().mockResolvedValue('OK')
      }
    }));
  }
});

// ---------------------------------------------------------------------------
// Jest compatibility shim (allows legacy tests that still call jest.* APIs)
// ---------------------------------------------------------------------------
// Vitest provides nearly identical mocking capability – we expose a lightweight
// shim so existing Jest-style mocks (`jest.mock`, `jest.fn`, etc.) keep working
// until each test file is migrated to pure Vitest syntax.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – augment global scope
if (!(globalThis as any).jest) {
  // Map basic APIs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jestShim: any = {
    mock: vi.mock,
    fn: vi.fn,
    spyOn: vi.spyOn,
    clearAllMocks: vi.clearAllMocks,
    resetAllMocks: vi.resetAllMocks,
    restoreAllMocks: vi.restoreAllMocks,
    useFakeTimers: vi.useFakeTimers,
    useRealTimers: vi.useRealTimers,
    advanceTimersByTime: vi.advanceTimersByTime,
  };

  (globalThis as any).jest = jestShim;
}

// Export test utilities
export const testUtils = {
  async waitForCondition(condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = await condition();
      if (result) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
  
  createMockBookingData: (overrides: any = {}) => ({
    serviceType: 'STANDARD_NOTARY',
    locationType: 'CLIENT_ADDRESS',
    customer: {
      email: 'test@example.com',
      name: 'Test User',
      phone: '555-123-4567'
    },
    location: {
      address: '123 Test St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    },
    serviceDetails: {
      serviceType: 'STANDARD_NOTARY',
      documentCount: 1,
      documentTypes: ['Affidavit'],
      signerCount: 1
    },
    scheduling: {
      preferredDate: '2024-02-15T14:00:00Z',
      preferredTime: '14:00'
    },
    payment: {
      paymentMethod: 'credit-card'
    },
    bookingSource: 'test',
    ...overrides
  }),

  generateTestId: (prefix = 'test') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

console.log('📋 Test environment setup loaded');