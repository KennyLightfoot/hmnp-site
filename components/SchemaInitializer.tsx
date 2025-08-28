"use client"

import { useEffect } from 'react'

export default function SchemaInitializer() {
  useEffect(() => {
    // Dynamic import to avoid server-side bundling issues
    import('@/lib/enhanced-schema-markup')
      .then(mod => {
        try {
          mod.initializeEnhancedSchemaMarkup()
        } catch (e) {
          // no-op
        }
      })
      .catch(() => {})
  }, [])

  return null
}









