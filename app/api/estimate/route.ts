import { NextRequest, NextResponse } from "next/server"
import { UnifiedPricingEngine } from "@/lib/pricing/unified-pricing-engine"
import { estimateDistanceFromAddress as estimateMiles, SERVICE_AREA_CONFIG } from "@/lib/config/maps"

export const runtime = "nodejs"

function isAfterHours(date: Date): boolean {
  const hour = date.getHours()
  const day = date.getDay() // 0 Sun - 6 Sat
  const isWeekend = day === 0 || day === 6
  // Business hours 8a–6p Mon–Fri
  const inBusinessHours = !isWeekend && hour >= 8 && hour < 18
  return !inBusinessHours
}

export async function POST(req: NextRequest) {
  try {
    const { mode, zip, acts = 1, when } = await req.json()
    const date = when ? new Date(when) : new Date()

    if (mode === "RON") {
      // Keep RON estimate simple and consistent with published pricing
      const total = Math.max(1, acts) * 25
      return NextResponse.json({
        ok: true,
        mode: "RON",
        breakdown: [{ label: "Online notarizations", amount: 25, qty: Math.max(1, acts) }],
        total,
      })
    }

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ ok: false, error: "A valid 5-digit ZIP code is required." }, { status: 400 })
    }

    // Map mode/time to service type
    const serviceType = isAfterHours(date) ? 'EXTENDED_HOURS' : 'STANDARD_NOTARY'

    // Offline-friendly distance estimate from base (77591)
    const miles = estimateMiles(String(zip))

    // Use UnifiedPricingEngine for accurate base + time-based pricing and tiered travel fees
    const pricing = await UnifiedPricingEngine.calculateTransparentPricing({
      serviceType: serviceType as any,
      documentCount: Math.max(1, Number(acts) || 1),
      signerCount: 1,
      address: String(zip),
      // Omit scheduledDateTime to avoid auto same-day surcharges in quick estimates
      customerType: 'new',
      requestId: `estimate_${Date.now()}`
    })

    // Build a compact breakdown for the estimator UI from the transparent result
    const breakdown: Array<{ label: string; amount: number }> = []
    breakdown.push({ label: serviceType === 'EXTENDED_HOURS' ? 'Mobile base (after-hours)' : 'Mobile base', amount: pricing.basePrice })
    // Per-act in-person notarizations ($10 each)
    const notaryFees = Math.max(1, Number(acts) || 1) * 10
    breakdown.push({ label: 'In-person notarizations', amount: notaryFees })
    if ((pricing.breakdown as any).travelFee?.amount) {
      const included = serviceType === 'EXTENDED_HOURS' ? SERVICE_AREA_CONFIG.RADII.EXTENDED : SERVICE_AREA_CONFIG.RADII.STANDARD
      breakdown.push({ label: `Travel beyond ${included}mi`, amount: (pricing.breakdown as any).travelFee.amount })
    }
    // Collapse time-based surcharges into one line for the strip
    // We omit time-based surcharges in this quick estimator

    return NextResponse.json({
      ok: true,
      mode: "MOBILE",
      miles: Math.round(miles * 10) / 10,
      breakdown,
      total: pricing.totalPrice + notaryFees,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 })
  }
}


