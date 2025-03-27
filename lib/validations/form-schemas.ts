import { z } from "zod"

// Booking form schemas
export const serviceDetailsSchema = z.object({
  serviceType: z.string({
    required_error: "Please select a service type",
  }),
  numberOfSigners: z.string({
    required_error: "Please select the number of signers",
  }),
  numberOfDocuments: z.string({
    required_error: "Please select the number of documents",
  }),
  preferredDate: z.date({
    required_error: "Please select a preferred date",
  }),
  preferredTime: z.string({
    required_error: "Please select a preferred time",
  }),
  location: z.string().min(10, "Please provide a complete address").max(500, "Address is too long"),
  documentInfo: z
    .string()
    .min(5, "Please provide some information about the documents")
    .max(500, "Document information is too long"),
  weekendService: z.boolean().optional(),
  extendedTravel: z.boolean().optional(),
})

export const contactInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long")
    .refine((val) => /^[0-9()\-\s+]*$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  additionalInfo: z.string().max(1000, "Additional information is too long").optional(),
})

// Combined booking form schema
export const bookingFormSchema = z.object({
  serviceDetails: serviceDetailsSchema,
  contactInfo: contactInfoSchema,
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms of service" }),
  }),
})

// Contact form schema
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long")
    .refine((val) => /^[0-9()\-\s+]*$/.test(val), {
      message: "Please enter a valid phone number",
    }),
  interest: z.string().optional(),
  message: z.string().min(10, "Please provide a detailed message").max(1000, "Message is too long"),
})

// Types derived from schemas
export type ServiceDetailsFormValues = z.infer<typeof serviceDetailsSchema>
export type ContactInfoFormValues = z.infer<typeof contactInfoSchema>
export type BookingFormValues = z.infer<typeof bookingFormSchema>
export type ContactFormValues = z.infer<typeof contactFormSchema>

