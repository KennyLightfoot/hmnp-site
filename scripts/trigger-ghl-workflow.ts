#!/usr/bin/env tsx

import 'dotenv/config'
import { findContactByEmail, createContact } from '@/lib/ghl/contacts'
import { addContactToWorkflow } from '@/lib/ghl/management'

type Args = {
  email: string
  name: string
  phone?: string
  workflowId: string
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {}
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i]
    const val = argv[i + 1]
    if (!key.startsWith('--')) continue
    switch (key) {
      case '--email': out.email = val; i++; break
      case '--name': out.name = val; i++; break
      case '--phone': out.phone = val; i++; break
      case '--workflowId': out.workflowId = val; i++; break
    }
  }
  if (!out.email || !out.name || !out.workflowId) {
    console.error('Required: --email --name --workflowId')
    process.exit(1)
  }
  return out as Args
}

async function ensureContact(email: string, name: string, phone?: string): Promise<string> {
  const existing = await findContactByEmail(email)
  if (existing?.id) return existing.id
  const parts = name.trim().split(' ')
  const firstName = parts.shift() || name
  const lastName = parts.join(' ') || '-'
  const created = await createContact({ firstName, lastName, email, phone, source: 'Workflow Test' })
  const id = (created as any)?.contact?.id || (created as any)?.id
  if (!id) throw new Error('Failed to create or retrieve contact ID')
  return id
}

async function main() {
  const args = parseArgs(process.argv)
  const contactId = await ensureContact(args.email, args.name, args.phone)
  console.log(`Contact ready: ${contactId}`)
  const res = await addContactToWorkflow(contactId, args.workflowId)
  console.log('Workflow trigger result:', JSON.stringify(res).slice(0, 500))
}

main().catch((err) => {
  console.error('Failed to trigger workflow:', err?.message || err)
  process.exit(1)
})


