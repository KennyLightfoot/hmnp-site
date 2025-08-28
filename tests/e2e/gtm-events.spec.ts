import { test, expect } from '@playwright/test'

async function setupDataLayerCapture(page) {
  await page.addInitScript(() => {
    (window as any).__pushedEvents = []
    const dl: any[] = ((window as any).dataLayer = (window as any).dataLayer || [])
    const origPush = dl.push.bind(dl)
    dl.push = function (...args: any[]) {
      try {
        const payload = args[0]
        ;(window as any).__pushedEvents.push(payload)
      } catch {}
      return origPush(...args)
    }
  })
}

function getEventsByName(events: any[], name: string) {
  return events.filter((e) => e && e.event === name)
}

test.describe('GTM events on LPs', () => {
  test('google-loan-signing: cta_clicked, call_clicked, booking_started', async ({ page }) => {
    await setupDataLayerCapture(page)
    await page.goto('http://localhost:3000/lp/google-loan-signing', { waitUntil: 'domcontentloaded' })
    // Hero primary CTA
    await page.getByRole('link', { name: /get started now|book your signing/i }).first().click()
    // MobileDock actions
    // Ensure dock present; if not yet, scroll to bottom to trigger hydration
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    // Book -> should push cta_clicked and GAConversionEvents booking_started
    await page.getByRole('link', { name: /book/i }).first().click()
    // Call -> call_clicked
    await page.getByRole('link', { name: /call/i }).first().click({ force: true })

    const events = await page.evaluate(() => (window as any).__pushedEvents || [])
    expect(getEventsByName(events, 'cta_clicked').length).toBeGreaterThan(0)
    expect(getEventsByName(events, 'call_clicked').length).toBeGreaterThan(0)
    expect(getEventsByName(events, 'booking_started').length).toBeGreaterThan(0)
  })

  test('facebook-campaign: cta_clicked, call_clicked', async ({ page }) => {
    await setupDataLayerCapture(page)
    await page.goto('http://localhost:3000/lp/facebook-campaign', { waitUntil: 'domcontentloaded' })
    // Scroll to hydrate and show dock
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    // Footer call button inside urgency section
    await page.getByRole('link', { name: /call \(832\) 617-4285/i }).click({ force: true })
    const events = await page.evaluate(() => (window as any).__pushedEvents || [])
    expect(getEventsByName(events, 'call_clicked').length).toBeGreaterThan(0)
  })
})


