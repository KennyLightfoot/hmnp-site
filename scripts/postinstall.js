/**
 * Custom postinstall hook that skips Prisma generation when not needed.
 *
 * Vercel builds (and other CI systems) can set `SKIP_PRISMA_GENERATE=true`
 * to bypass `prisma generate`, which currently fails because the schema
 * references models that are still being refactored. Local development
 * keeps the default behaviour so the Prisma client is generated.
 */
import { execSync } from 'node:child_process'

const skip =
  process.env.SKIP_PRISMA_GENERATE === 'true' ||
  process.env.VERCEL === '1'

if (skip) {
  console.log('[postinstall] Skipping `prisma generate` (SKIP_PRISMA_GENERATE/VERCEL set).')
  process.exit(0)
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch (error) {
  console.error('[postinstall] Failed to run `prisma generate`.')
  console.error(error.message || error)
  process.exit(1)
}


