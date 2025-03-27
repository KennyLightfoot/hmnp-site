// Utility to debug form data
export function debugFormData(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    result[key] = typeof value === "string" ? value : "[File or complex value]"
  }

  return result
}

