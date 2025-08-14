#!/usr/bin/env tsx

import 'dotenv/config'

async function main() {
  const start = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  const payload = {
    serviceType: 'STANDARD_NOTARY',
    customerName: 'John Test',
    customerEmail: 'john.test.workflow@kandji.app',
    scheduledDateTime: start,
    pricing: { totalPrice: 75 }
  }

  const res = await fetch('http://localhost:3000/api/booking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  console.log('Status:', res.status)
  console.log('Body:', text)
}

main().catch((err) => {
  console.error('Booking create failed:', err?.message || err)
  process.exit(1)
})


