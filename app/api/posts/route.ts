import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

type DraftRequest = {
  title: string
  excerpt?: string
  meta?: {
    description?: string
    keywords?: string[]
  }
  body: string
  city?: string
  target_keywords?: string[]
}

export const runtime = 'nodejs'

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

function escapeYaml(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return value
  // Wrap in double quotes and escape inner quotes
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const expectedToken = process.env.N8N_POSTS_TOKEN

  if (!expectedToken) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice('Bearer '.length)
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let payload: DraftRequest
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload?.title || !payload?.body) {
    return NextResponse.json({ error: 'Missing required fields: title, body' }, { status: 400 })
  }

  const baseDir = path.join(process.cwd(), 'content', 'blog')
  const dateIso = new Date().toISOString()
  let slugBase = toSlug(payload.title)
  if (!slugBase) slugBase = 'post'

  // Ensure unique slug by appending incrementing suffix if needed
  let slug = slugBase
  let suffix = 1
  while (await pathExists(path.join(baseDir, `${slug}.md`))) {
    suffix += 1
    slug = `${slugBase}-${suffix}`
  }

  const filePath = path.join(baseDir, `${slug}.md`)

  const fmTitle = escapeYaml(payload.title) ?? '"Untitled"'
  const fmDesc = escapeYaml(payload.meta?.description)
  const fmExcerpt = escapeYaml(payload.excerpt)
  const fmCity = escapeYaml(payload.city)
  const fmKeywords = Array.isArray(payload.meta?.keywords) ? payload.meta!.keywords : []
  const fmTargetKeywords = Array.isArray(payload.target_keywords) ? payload.target_keywords : []

  const frontmatterLines: string[] = [
    '---',
    `title: ${fmTitle}`,
    `slug: ${slug}`,
    `date: ${dateIso}`,
  ]
  if (fmDesc) frontmatterLines.push(`description: ${fmDesc}`)
  if (fmExcerpt) frontmatterLines.push(`excerpt: ${fmExcerpt}`)
  if (fmCity) frontmatterLines.push(`city: ${fmCity}`)
  if (fmKeywords.length) {
    frontmatterLines.push('keywords:')
    for (const kw of fmKeywords) {
      frontmatterLines.push(`  - ${escapeYaml(kw)}`)
    }
  }
  if (fmTargetKeywords.length) {
    frontmatterLines.push('target_keywords:')
    for (const kw of fmTargetKeywords) {
      frontmatterLines.push(`  - ${escapeYaml(kw)}`)
    }
  }
  frontmatterLines.push('---')

  const content = `${frontmatterLines.join('\n')}\n\n${payload.body}\n`

  try {
    // Ensure base directory exists
    await fs.mkdir(baseDir, { recursive: true })
    await fs.writeFile(filePath, content, 'utf8')
  } catch (error) {
    return NextResponse.json({ error: 'Failed to persist draft' }, { status: 500 })
  }

  return NextResponse.json({ id: `${Date.now()}`, slug, status: 'draft' })
}


