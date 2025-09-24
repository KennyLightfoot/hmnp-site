import { type NextRequest, NextResponse } from "next/server";
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ input: z.string().min(1) });

export const GET = withRateLimit('public', 'places_autocomplete')(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const parsed = schema.safeParse({ input: searchParams.get('input') });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }
  const { input } = parsed.data;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!input) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }
  if (!apiKey) {
    console.error("Google Maps API Key is not configured.");
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const location = "29.7604,-95.3698"; // Houston, TX
  const radius = "50000"; // 50km

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&location=${location}&radius=${radius}&components=country:us`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Places Autocomplete API response error:", errorBody);
      throw new Error(`Google Maps API responded with status ${response.status}`);
    }
    const data = await response.json();
        return NextResponse.json(data);
  } catch (error) {
    console.error("Places Autocomplete API error:", error);
    return NextResponse.json({ error: "Failed to fetch autocomplete data" }, { status: 500 });
  }
});