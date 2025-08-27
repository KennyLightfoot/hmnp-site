import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Configuration with sensible defaults; can be overridden via env
const ORIGIN_COORDS = {
  lat: parseFloat(process.env.HMNP_ORIGIN_LAT || "29.3833"), // Texas City
  lng: parseFloat(process.env.HMNP_ORIGIN_LNG || "-94.9025"),
}

const INCLUDED_RADIUS_MILES = {
  STANDARD_NOTARY: 20,
  EXTENDED_HOURS: 30,
}

const BASES = {
  MOBILE_STANDARD: 75,
  MOBILE_AFTERHOURS: 125,
  RON_PER_ACT: 25,
  IN_PERSON_PER_ACT: 10,
}

const TIERED_RATES: { upToMilesBeyond: number; ratePerMile: number }[] = [
  { upToMilesBeyond: 10, ratePerMile: 2.0 },
  { upToMilesBeyond: 30, ratePerMile: 2.5 },
  { upToMilesBeyond: Infinity, ratePerMile: 3.0 },
]

type Coordinates = { lat: number; lng: number }

function toRad(v: number): number {
  return (v * Math.PI) / 180
}

function haversineMiles(a: Coordinates, b: Coordinates): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

function estimateDrivingMiles(straightLineMiles: number): number {
  // Conservative multiplier to approximate real-world driving distance
  const multiplier = 1.2
  return straightLineMiles * multiplier
}

async function geocodeZip(zip: string): Promise<Coordinates> {
  // Prefer Mapbox when token provided; else fallback to OSM Nominatim
  const mapboxToken = process.env.MAPBOX_TOKEN
  if (mapboxToken) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      zip
    )}.json?types=postcode&access_token=${mapboxToken}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to geocode ZIP (Mapbox)")
    const data = await res.json()
    const hit = data.features?.[0]
    if (!hit) throw new Error("ZIP code not found")
    const [lng, lat] = hit.center
    return { lat, lng }
  }

  // OSM fallback
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&postalcode=${encodeURIComponent(
    zip
  )}`
  const res = await fetch(url, { headers: { "User-Agent": "hmnp-site/estimate-route" } })
  if (!res.ok) throw new Error("Failed to geocode ZIP (OSM)")
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!data || data.length === 0) throw new Error("ZIP code not found")
  const first = data[0]
  if (!first || first.lat == null || first.lon == null) throw new Error("ZIP code not found")
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
}

function isAfterHours(date: Date): boolean {
  const hour = date.getHours()
  const day = date.getDay() // 0 Sun - 6 Sat
  const isWeekend = day === 0 || day === 6
  // Business hours 8a–6p Mon–Fri
  const inBusinessHours = !isWeekend && hour >= 8 && hour < 18
  return !inBusinessHours
}

function calcTieredBeyondFee(beyondMiles: number): number {
  if (beyondMiles <= 0) return 0
  let remaining = beyondMiles
  let fee = 0
  for (const tier of TIERED_RATES) {
    if (remaining <= 0) break
    const applyMiles = Math.min(remaining, tier.upToMilesBeyond === Infinity ? remaining : tier.upToMilesBeyond)
    fee += applyMiles * tier.ratePerMile
    remaining -= applyMiles
  }
  return Math.round(fee)
}

async function drivingMiles(origin: Coordinates, dest: Coordinates): Promise<number> {
  const straight = haversineMiles(origin, dest)
  return estimateDrivingMiles(straight)
}

export async function POST(req: NextRequest) {
  try {
    const { mode, zip, acts = 1, when } = await req.json()
    const date = when ? new Date(when) : new Date()

    if (mode === "RON") {
      const total = Math.max(1, acts) * BASES.RON_PER_ACT
      return NextResponse.json({
        ok: true,
        mode: "RON",
        breakdown: [{ label: "Online notarizations", amount: BASES.RON_PER_ACT, qty: Math.max(1, acts) }],
        total,
      })
    }

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ ok: false, error: "A valid 5-digit ZIP code is required." }, { status: 400 })
    }

    const dest = await geocodeZip(zip)
    const miles = await drivingMiles(ORIGIN_COORDS, dest)
    const afterHours = isAfterHours(date)
    const included = afterHours ? INCLUDED_RADIUS_MILES.EXTENDED_HOURS : INCLUDED_RADIUS_MILES.STANDARD_NOTARY
    const beyond = Math.max(0, miles - included)
    const travelFee = calcTieredBeyondFee(beyond)
    const base = afterHours ? BASES.MOBILE_AFTERHOURS : BASES.MOBILE_STANDARD
    const notaryFees = Math.max(1, acts) * BASES.IN_PERSON_PER_ACT
    const total = base + notaryFees + travelFee

    return NextResponse.json({
      ok: true,
      mode: "MOBILE",
      miles: Math.round(miles * 10) / 10,
      breakdown: [
        { label: afterHours ? "Mobile base (after-hours)" : "Mobile base", amount: base },
        { label: `In-person notarizations`, amount: notaryFees },
        ...(travelFee > 0 ? [{ label: `Travel beyond ${included}mi`, amount: travelFee }] : []),
      ],
      total,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 })
  }
}


