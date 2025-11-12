"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import "@/lib/pwa/service-worker"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <PWAProvider>
        {children}
      </PWAProvider>
    </ThemeProvider>
  )
}
