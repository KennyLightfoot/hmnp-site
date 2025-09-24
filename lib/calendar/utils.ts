export function extractCalendarEventIdFromNotes(notes: string | null): string | null {
  if (!notes) return null
  const match = notes.match(/Google Calendar Event ID: ([a-zA-Z0-9_-]+)/)
  return match && match[1] ? match[1] : null
}


