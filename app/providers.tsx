"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { withLDProvider } from '@launchdarkly/react-client-sdk'

// LaunchDarkly configuration
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

// Wrap with LaunchDarkly provider if client ID is available
export default ldClientId ? withLDProvider({
  clientSideID: ldClientId,
  context: {
    kind: 'user',
    anonymous: true
  },
  options: {
    bootstrap: 'localStorage'
  }
})(Providers) : Providers
