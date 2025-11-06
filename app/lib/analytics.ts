export type EventProps = Record<string, string | number | boolean | undefined | null>

export function track(eventName: string, props: EventProps = {}) {
  if (typeof window === 'undefined' || !(window as any).dataLayer) return
  ;(window as any).dataLayer.push({
    event: eventName,
    ...props,
  })
}

export function trackBookingFunnel(stage: string, props: EventProps = {}) {
  track('booking_funnel', {
    funnel_stage: stage,
    ts: Date.now(),
    ...props,
  })
}


