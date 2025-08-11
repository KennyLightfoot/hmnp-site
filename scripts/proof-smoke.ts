import { proofAPI } from '@/lib/proof/api'

async function main() {
  const enabled = proofAPI.isEnabled()
  console.log(`[Proof Smoke] Enabled: ${enabled}`)
  if (!enabled) {
    console.log('[Proof Smoke] PROOF_API_KEY not configured; skipping live check')
    process.exit(0)
  }
  const ok = await proofAPI.testConnection()
  console.log(`[Proof Smoke] testConnection: ${ok ? 'OK' : 'FAILED'}`)
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error('[Proof Smoke] Error:', e)
  process.exit(1)
})


