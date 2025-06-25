"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

// LaunchDarkly configuration with fallback
const ldClientId = process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID || ''

interface ProvidersProps {
  children: React.ReactNode
  session?: any
}

function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

// Conditional LaunchDarkly wrapper - graceful degradation
let WrappedProviders = Providers

if (ldClientId) {
  try {
    const { withLDProvider } = require('@launchdarkly/react-client-sdk')
    WrappedProviders = withLDProvider({
      clientSideID: ldClientId,
      context: {
        kind: 'user',
        anonymous: true
      },
      options: {
        bootstrap: 'localStorage'
      }
    })(Providers)
  } catch (error) {
    console.log('LaunchDarkly not available, using fallback provider')
  }
}

export default WrappedProviders
