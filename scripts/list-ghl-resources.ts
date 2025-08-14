#!/usr/bin/env tsx

import 'dotenv/config'

async function call(endpoint: string) {
  const base = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com'
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY
  const version = process.env.GHL_API_VERSION || '2021-07-28'
  const headers: any = {
    'Authorization': `Bearer ${token}`,
    'Version': version,
    'Content-Type': 'application/json'
  }
  if (process.env.GHL_LOCATION_ID) headers['LocationId'] = process.env.GHL_LOCATION_ID
  const res = await fetch(`${base}${endpoint}`, { headers })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = text }
  return { status: res.status, body: json }
}

async function main() {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) {
    console.error('Missing GHL_LOCATION_ID in environment')
    process.exit(1)
  }

  console.log('Listing pipelines...')
  const pipes = await call(`/opportunities/pipelines?locationId=${locationId}`)
  console.log('Status:', pipes.status)
  console.log(JSON.stringify(pipes.body, null, 2))

  console.log('\nListing calendars...')
  const cals = await call(`/calendars?locationId=${locationId}`)
  console.log('Status:', cals.status)
  console.log(JSON.stringify(cals.body, null, 2))
}

main().catch((err) => { console.error(err); process.exit(1) })


