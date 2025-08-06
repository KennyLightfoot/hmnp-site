import { type NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import type { TimeSlot } from "@/lib/types/booking";

// Mock – in real app you'd query DB
function generateMockSlots(date: DateTime): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  
  // Check if date is in the past (use same timezone as input)
  const now = DateTime.now().setZone(date.zone);
  if (date < now.startOf("day")) return [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (Math.random() > 0.3) {
        const startTime = date.set({ hour, minute, second: 0, millisecond: 0 });
        if (startTime < now) continue;
        const demandLevels = ["low", "moderate", "high"] as const;
        slots.push({
          startTime: startTime.toISO(),
          endTime: startTime.plus({ minutes: 60 }).toISO(),
          duration: 60,
          demand: demandLevels[Math.floor(Math.random() * 3)],
        } as TimeSlot);
      }
    }
  }
  return slots;
}

// Simple in-memory cache to prevent duplicate requests
const cache = new Map<string, { data: any; expires: number }>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  
  // Create cache key
  const cacheKey = `availability-${dateStr}`;
  const now = Date.now();
  
  // Check cache first (5 minute TTL)
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.data);
  }
  
  // Force timezone to business timezone (Houston = America/Chicago)
  const requestedDate = DateTime.fromISO(dateStr, { zone: "America/Chicago" });
  if (!requestedDate.isValid)
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  
  try {
    const availableSlots = generateMockSlots(requestedDate);
    const response = { availableSlots };
    
    // Cache the response
    cache.set(cacheKey, {
      data: response,
      expires: now + (5 * 60 * 1000) // 5 minutes
    });
    
    // Clean old entries
    for (const [key, value] of cache.entries()) {
      if (value.expires <= now) {
        cache.delete(key);
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}