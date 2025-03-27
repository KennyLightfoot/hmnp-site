"use client"

import type React from "react"

import { type SectionId, useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface ClientWrapperProps {
  children: React.ReactNode
  sectionId: SectionId
  className?: string
}

export function ClientWrapper({ children, sectionId, className }: ClientWrapperProps) {
  const { theme } = useTheme()
  const sectionColor = theme.sectionColors[sectionId]

  return <section className={cn("relative py-16 md:py-20", sectionColor, className)}>{children}</section>
}

