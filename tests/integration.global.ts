import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'node:path';

const execAsync = promisify(exec);

export default async function setup() {
  // Only run once for the entire integration test run
  process.env.TEST_TYPE = 'integration';
  process.env.VITEST_GLOBAL_SETUP = 'true';
  process.env.PORT = process.env.PORT || '3000';

  // Ensure clean docker state to avoid container name conflicts
  try {
    await execAsync('docker compose -f tests/docker-compose.yml down -v', {
      cwd: path.join(__dirname, '..')
    });
  } catch {}

  // Remove any lingering containers/volumes by explicit name (ignore errors)
  try { await execAsync('docker rm -f hmnp-postgres-test hmnp-redis-test'); } catch {}
  try { await execAsync('docker volume rm tests_postgres_test_data tests_redis_test_data'); } catch {}

  await execAsync('docker compose -f tests/docker-compose.yml up -d postgres-test redis-test', {
    cwd: path.join(__dirname, '..')
  });

  // Wait for Postgres to be ready
  let retries = 30;
  while (retries > 0) {
    try {
      await execAsync('docker compose -f tests/docker-compose.yml exec -T postgres-test pg_isready -U hmnp_test', {
        cwd: path.join(__dirname, '..')
      });
      break;
    } catch {
      retries--;
      if (retries === 0) throw new Error('PostgreSQL health check failed (global setup)');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Apply Prisma migrations to test DB
  const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://hmnp_test:test_password_2024@localhost:5433/hmnp_test_db';
  await execAsync(`bash -lc 'export DATABASE_URL=${TEST_DB_URL} && pnpm prisma migrate deploy'`);

  // Start Next dev server if not already running
  const baseUrl = `http://localhost:${process.env.PORT}`;
  async function waitForHealth(timeoutMs = 120_000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch(`${baseUrl}/api/health/status`);
        if (res.ok) return;
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error('Next server did not become ready within timeout (global setup)');
  }

  // Check if server is already responding
  let serverUp = false;
  try {
    const res = await fetch(`${baseUrl}/api/health/status`);
    serverUp = res.ok;
  } catch {}

  if (!serverUp) {
    // Start in background and wait
    exec('pnpm dev', { env: { ...process.env } });
    await waitForHealth();
  }

  return async () => {
    // Teardown after all tests
    try {
      await execAsync('docker compose -f tests/docker-compose.yml down -v', {
        cwd: path.join(__dirname, '..')
      });
    } catch {}
  };
}


