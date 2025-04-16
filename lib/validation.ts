import { z } from "zod"

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  date: z.string().transform((str) => new Date(str)),
  time: z.string().min(1, "Time is required"),
  serviceType: z.string().min(1, "Service type is required"),
  location: z.string().min(1, "Location is required"),
  numberOfSigners: z.number().int().positive().default(1),
  numberOfDocs: z.number().int().positive().default(1),
  notes: z.string().optional(),
})

export function validateBookingData(data: unknown) {
  const result = bookingSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
