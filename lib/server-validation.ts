import { z } from "zod"

export async function validateFormData<T extends z.ZodType>(
  formData: FormData,
  schema: T,
): Promise<{ success: boolean; data?: z.infer<T>; errors?: Record<string, string> }> {
  try {
    // Convert FormData to a plain object
    const formValues: Record<string, unknown> = {}

    formData.forEach((value, key) => {
      // Handle checkbox values
      if (value === "on") {
        formValues[key] = true
      }
      // Handle date values
      else if (key.includes("date") && typeof value === "string") {
        try {
          formValues[key] = new Date(value)
        } catch {
          formValues[key] = value
        }
      }
      // Handle all other values
      else {
        formValues[key] = value
      }
    })

    // Validate with Zod schema
    const validatedData = schema.parse(formValues)

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}

      error.errors.forEach((err) => {
        const key = err.path.join(".")
        errors[key] = err.message
      })

      return {
        success: false,
        errors,
      }
    }

    return {
      success: false,
      errors: {
        _form: "An unexpected error occurred. Please try again.",
      },
    }
  }
}

