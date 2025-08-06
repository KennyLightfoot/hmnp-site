import { type NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import type { TimeSlot } from "@/lib/types/booking";

// Mock – in real app you’d query DB
function generateMockSlots(date: DateTime): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  if (date < DateTime.now().startOf("day")) return [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (Math.random() > 0.3) {
        const startTime = date.set({ hour, minute, second: 0, millisecond: 0 });
        if (startTime < DateTime.now()) continue;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  const requestedDate = DateTime.fromISO(dateStr);
  if (!requestedDate.isValid)
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  try {
    const availableSlots = generateMockSlots(requestedDate);
    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}