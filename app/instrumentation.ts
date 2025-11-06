import type { Metric } from 'web-vitals'

const RUM_ENDPOINT = '/api/rum'

function sendMetric(body: string) {
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(RUM_ENDPOINT, blob)) {
        return
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[RUM] sendBeacon failed, falling back to fetch', error)
      }
    }
  }

  fetch(RUM_ENDPOINT, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).catch((error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[RUM] metric delivery failed', error)
    }
  })
}

export function reportWebVitals(metric: Metric) {
  if (typeof window === 'undefined') return
  if (process.env.NEXT_PUBLIC_ENABLE_RUM !== 'true') return

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

    const payload = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: navigationEntry?.type,
      path: window.location.pathname,
      href: window.location.href,
      ts: Date.now(),
      userAgent: navigator.userAgent,
    }

    const body = JSON.stringify(payload)
    sendMetric(body)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[RUM] reportWebVitals failed', error)
    }
  }
}

