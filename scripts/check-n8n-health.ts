/* eslint-disable no-console */

const BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const HEALTH_PATH = process.env.N8N_HEALTH_ENDPOINT || '/healthz';
const TIMEOUT_MS = Number(process.env.N8N_HEALTH_TIMEOUT_MS || 5000);

function buildAuthHeader(): string | undefined {
  const user = process.env.N8N_BASIC_AUTH_USER;
  const pass = process.env.N8N_BASIC_AUTH_PASSWORD;
  if (user && pass) {
    const token = Buffer.from(`${user}:${pass}`, 'utf8').toString('base64');
    return `Basic ${token}`;
  }
  return undefined;
}

async function checkHealth() {
  const url = new URL(HEALTH_PATH, BASE_URL);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    const authHeader = buildAuthHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`n8n health endpoint returned ${response.status}`);
    }

    const body = await response.json().catch(() => ({}));
    console.log(`n8n healthy (${url.toString()})`, body);
  } catch (error) {
    console.error('n8n health check failed:', error);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

void checkHealth();

