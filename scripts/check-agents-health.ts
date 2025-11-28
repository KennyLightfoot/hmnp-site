import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const maybeConfig =
    // ESM namespace export
    (dotenv as any).config ||
    // Some bundlers stick it under default
    (dotenv as any).default?.config;

  if (typeof maybeConfig === 'function') {
    maybeConfig({ path: filePath, override: true });
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));

const baseUrl = process.env.AGENTS_BASE_URL || 'http://localhost:4001';
const healthPath = process.env.AGENTS_HEALTH_ENDPOINT || '/health';
const timeoutMs = Number(process.env.AGENTS_HEALTH_TIMEOUT_MS || 5000);
const isRequired = process.env.AGENTS_HEALTH_REQUIRED === 'true';

const healthUrl = new URL(healthPath, baseUrl);
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

async function main() {
  console.log(`🔍 Checking agents service health at ${healthUrl.toString()} (timeout ${timeoutMs}ms)`);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.AGENTS_ADMIN_SECRET) {
    headers['x-api-key'] = process.env.AGENTS_ADMIN_SECRET;
  }

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = `Agents health endpoint returned ${response.status} ${response.statusText}`;
      console.error(`❌ ${message}`);
      if (isRequired) {
        process.exitCode = 1;
      }
      return;
    }

    const body = await response.json().catch(() => ({}));
    console.log('✅ Agents pipeline is reachable');
    console.log(JSON.stringify({ url: healthUrl.toString(), body }, null, 2));
    process.exitCode = 0;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
    console.error('❌ Unable to reach agents service');
    console.error(`   URL: ${healthUrl.toString()}`);
    console.error(`   Error: ${message}`);
    process.exitCode = isRequired ? 1 : 0;
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected failure while checking agents health', error);
  process.exitCode = 1;
});

