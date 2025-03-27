"use client"

import { useState } from "react"
import { z } from "zod"

export function useFormValidation<T extends z.ZodType>(schema: T) {
  type FormValues = z.infer<T>

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})

  const validate = (values: FormValues): boolean => {
    try {
      schema.parse(values)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof FormValues, string>> = {}

        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormValues
          formattedErrors[path] = err.message
        })

        setErrors(formattedErrors)
      }
      return false
    }
  }

  const getFieldError = (field: keyof FormValues): string | undefined => {
    return errors[field]
  }

  const clearErrors = () => {
    setErrors({})
  }

  return {
    errors,
    validate,
    getFieldError,
    clearErrors,
  }
}

