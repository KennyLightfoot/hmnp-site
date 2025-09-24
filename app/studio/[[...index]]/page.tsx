// This route enables showing the Sanity Studio embeded in the Next.js app
// It redirects to /studio/desk, the main desk tool interface
// It's embedded within the existing site layout

'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
} 