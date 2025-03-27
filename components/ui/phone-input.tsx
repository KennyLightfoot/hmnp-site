"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input, type InputProps } from "@/components/ui/input"

interface PhoneInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string
  onChange: (value: string) => void
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Format phone number for display
  useEffect(() => {
    if (!value) {
      setDisplayValue("")
      return
    }

    // Remove all non-numeric characters
    const digitsOnly = value.replace(/\D/g, "")

    // Format the phone number
    let formatted = ""
    if (digitsOnly.length <= 3) {
      formatted = digitsOnly
    } else if (digitsOnly.length <= 6) {
      formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`
    } else {
      formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`
    }

    setDisplayValue(formatted)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Remove all non-numeric characters for the actual value
    const digitsOnly = input.replace(/\D/g, "")

    // Update the actual value
    onChange(digitsOnly)
  }

  return <Input type="tel" autoComplete="tel" value={displayValue} onChange={handleChange} {...props} />
}

