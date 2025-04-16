import { format } from "date-fns"

export function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ")
}

export function formatDate(date: Date | string): string {
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date
    return format(parsedDate, "MMMM dd, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}
