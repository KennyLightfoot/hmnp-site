import * as z from "zod";

// Schema for creating/updating assignments
export const assignmentSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  borrowerName: z.string().optional(),
  propertyAddress: z.string().optional(),
  closingDate: z.coerce.date().optional().nullable(), // Coerce string/number to Date
  partnerAssignedToId: z.string().cuid({ message: "Invalid Partner ID format." }).optional().nullable(),
  allowPartnerComments: z.boolean().optional(),
  // Add reference if needed
  reference: z.string().optional(), 
});

export type AssignmentFormData = z.infer<typeof assignmentSchema>; 