import { type NextRequest, NextResponse } from "next/server";
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ address: z.string().min(1) });

export const GET = withRateLimit('public', 'maps_geocode')(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({ address: searchParams.get('address') });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid address' }, { status: 400 });
  }
  const { address } = parsed.data;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }
  if (!apiKey) {
    console.error("Google Maps API Key is not configured.");
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Geocoding API response error:", errorBody);
      throw new Error(`Google Maps API responded with status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json({ error: "Failed to fetch geocoding data" }, { status: 500 });
  }
});