"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Define the section IDs that can have customizable backgrounds
export type SectionId =
  | "hero"
  | "features"
  | "services"
  | "tabbed-content"
  | "comparison"
  | "process"
  | "testimonials"
  | "faq"
  | "service-area"
  | "cta"

// Define the structure of our theme state
interface ThemeState {
  sectionColors: Record<SectionId, string>
}

// Define the default theme
export const defaultTheme = {
  hero: "bg-gradient-to-b from-oxfordBlue/10 to-background",
  features: "bg-slate-200",
  services: "bg-background",
  "tabbed-content": "bg-slate-300/70",
  comparison: "bg-background",
  process: "bg-slate-200",
  testimonials: "bg-slate-300/70",
  faq: "bg-background",
  "service-area": "bg-slate-200",
  cta: "bg-oxfordBlue/10",
}

export const presetThemes = {
  light: { ...defaultTheme },
  dark: {
    hero: "bg-gradient-to-b from-gray-800 to-gray-900",
    features: "bg-gray-700",
    services: "bg-gray-800",
    "tabbed-content": "bg-gray-600",
    comparison: "bg-gray-700",
    process: "bg-gray-600",
    testimonials: "bg-gray-700",
    faq: "bg-gray-800",
    "service-area": "bg-gray-700",
    cta: "bg-gray-900",
  },
}

// Define the context interface
interface ThemeContextType {
  theme: ThemeState
  setSectionColor: (sectionId: SectionId, color: string) => void
  applyPresetTheme: (themeName: keyof typeof presetThemes) => void
  resetTheme: () => void
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Create a provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>({
    sectionColors: { ...defaultTheme },
  })

  const setSectionColor = (sectionId: SectionId, color: string) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      sectionColors: {
        ...prevTheme.sectionColors,
        [sectionId]: color,
      },
    }))
  }

  const applyPresetTheme = (themeName: keyof typeof presetThemes) => {
    setTheme({ sectionColors: { ...presetThemes[themeName] } })
  }

  const resetTheme = () => {
    setTheme({ sectionColors: { ...defaultTheme } })
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setSectionColor,
        applyPresetTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

