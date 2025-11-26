// Env alignment checker for hmnp-site (Next.js) and agents service
//
// Usage:
//   pnpm check:agents-env
//
// This is intentionally read-only: it only inspects env files and exits
// with a non-zero status if required values are missing or inconsistent.

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  return dotenv.parse(raw);
}

function loadEnvSet(baseDir) {
  const envPath = path.join(baseDir, '.env');
  const localPath = path.join(baseDir, '.env.local');
  return {
    ...loadEnvFile(envPath),
    ...loadEnvFile(localPath), // .env.local wins
  };
}

const rootDir = process.cwd();
const agentsDir = path.join(rootDir, 'agents');

const rootEnv = loadEnvSet(rootDir);
const agentsEnv = loadEnvSet(agentsDir);

function checkMissing(envObj, required, label) {
  const missing = required.filter((key) => !envObj[key]);
  if (missing.length) {
    console.log(`\n[${label}] Missing env vars:`);
    for (const key of missing) {
      console.log(`  - ${key}`);
    }
  } else {
    console.log(`\n[${label}] All required env vars present.`);
  }
  return missing;
}

// Root (Next.js) must know how to talk to agents and verify webhooks
const requiredRoot = ['AGENTS_BASE_URL', 'NEXTJS_API_SECRET'];

// Agents service must have its own runtime + webhook config
const requiredAgents = [
  'NODE_ENV',
  'HMNP_ENV',
  'OPENAI_API_KEY',
  'PORT',
  'NEXTJS_WEBHOOK_URL',
  'NEXTJS_API_SECRET',
];

const missingRoot = checkMissing(rootEnv, requiredRoot, 'ROOT');
const missingAgents = checkMissing(agentsEnv, requiredAgents, 'AGENTS');

// Cross-checks for consistency between the two repos
const problems = [];

// Shared webhook secret must match
if (rootEnv.NEXTJS_API_SECRET && agentsEnv.NEXTJS_API_SECRET) {
  if (rootEnv.NEXTJS_API_SECRET !== agentsEnv.NEXTJS_API_SECRET) {
    problems.push(
      'NEXTJS_API_SECRET mismatch between root and agents (webhooks will fail).',
    );
  }
}

// AGENTS_BASE_URL should include the agents PORT in common setups
if (rootEnv.AGENTS_BASE_URL && agentsEnv.PORT) {
  const port = agentsEnv.PORT;
  if (!rootEnv.AGENTS_BASE_URL.includes(`:${port}`)) {
    problems.push(
      `AGENTS_BASE_URL (${rootEnv.AGENTS_BASE_URL}) does not include agents PORT ${port}.`,
    );
  }
}

// Basic sanity check for a local dev pairing
if (agentsEnv.NEXTJS_WEBHOOK_URL) {
  const localUrl = 'http://localhost:3000';
  if (
    process.env.NODE_ENV === 'production' &&
    agentsEnv.NEXTJS_WEBHOOK_URL === localUrl
  ) {
    problems.push(
      `AGENTS NEXTJS_WEBHOOK_URL is still ${localUrl} but NODE_ENV=production. ` +
        'Set it to your real site URL in production.',
    );
  }
}

if (!missingRoot.length && !missingAgents.length && problems.length === 0) {
  console.log('\n✅ Env check passed. Root + agents are aligned.');
  process.exit(0);
} else {
  if (problems.length) {
    console.log('\n[Cross-check issues]');
    for (const p of problems) {
      console.log(`  - ${p}`);
    }
  }
  console.log('\n⚠️ Env check found issues. See details above.');
  process.exit(1);
}


