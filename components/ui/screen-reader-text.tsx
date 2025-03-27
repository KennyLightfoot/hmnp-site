import type React from "react"
import { cn } from "@/lib/utils"

interface ScreenReaderTextProps {
  children: React.ReactNode
  className?: string
}

export function ScreenReaderText({ children, className }: ScreenReaderTextProps) {
  return <span className={cn("sr-only", className)}>{children}</span>
}

