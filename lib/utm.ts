export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  msclkid?: string
  fbclid?: string
  ref?: string
}

const KEYS = [
  'utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','msclkid','fbclid','ref'
] as const

export function readAttributionFromUrl(): Attribution {
  if (typeof window === 'undefined') return {}
  const url = new URL(window.location.href)
  const data: Attribution = {}
  KEYS.forEach((k) => {
    const v = url.searchParams.get(k as string)
    if (v) (data as any)[k] = v
  })
  return data
}

export function persistAttribution(): void {
  if (typeof window === 'undefined') return
  const data = readAttributionFromUrl()
  try {
    const existing = JSON.parse(localStorage.getItem('utm_attribution') || '{}')
    const merged = { ...existing, ...data }
    localStorage.setItem('utm_attribution', JSON.stringify(merged))
  } catch {
    // ignore
  }
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('utm_attribution')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}







