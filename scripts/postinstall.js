/**
 * Custom postinstall hook that generates Prisma Client.
 *
 * Vercel builds and CI systems will generate Prisma Client unless explicitly
 * skipped via `SKIP_PRISMA_GENERATE=true` environment variable.
 */
import { execSync } from 'node:child_process'

const skip = process.env.SKIP_PRISMA_GENERATE === 'true'

if (skip) {
  console.log('[postinstall] Skipping `prisma generate` (SKIP_PRISMA_GENERATE set).')
  process.exit(0)
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch (error) {
  console.error('[postinstall] Failed to run `prisma generate`.')
  console.error(error.message || error)
  process.exit(1)
}


