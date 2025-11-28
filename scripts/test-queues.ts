/**
 * BullMQ queue system test script
 *
 * Usage:
 *   pnpm ts-node scripts/test-queues.ts
 *
 * This script calls the same queue system test used by `/api/system-test`,
 * so CI and local dev can run a quick check without hitting the HTTP route.
 */

import { runQueueSystemTest } from '@/lib/testing/queue-system-test';

async function main() {
  console.log('🧪 Running BullMQ queue system test...');
  const result = await runQueueSystemTest();

  console.log('Result:', result);

  if (result.status === 'FAIL') {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Queue system test script failed:', err);
  process.exitCode = 1;
});


