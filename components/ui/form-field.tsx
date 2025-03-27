import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  id: string
  label: string
  children: React.ReactNode
  error?: string
  description?: string
  required?: boolean
  className?: string
}

export function FormField({ id, label, children, error, description, required = false, className }: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className={cn(error && "text-destructive")}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          name: id,
          "aria-describedby": cn(descriptionId, errorId),
          "aria-required": required,
          "aria-invalid": error ? "true" : "false",
        })}
      </div>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm font-medium text-destructive" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}

