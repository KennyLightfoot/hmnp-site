import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Metadata } from "next"
import { PreloadAssets } from "./preload-assets"
import { ThemeProvider } from "@/contexts/theme-context"
import { Inter } from "next/font/google"

// Import the LocalBusinessSchema component
import { LocalBusinessSchema } from "@/components/structured-data"

// Add imports at the top
import { PendingSubmissionsProcessor } from "@/components/pending-submissions-processor"
import { ApiHealthMonitor } from "@/components/api-health-monitor"
import { CacheProvider } from "@/components/cache-provider"

// Optimize font loading
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Use 'swap' to prevent FOIT (Flash of Invisible Text)
  preload: true,
})

const inter = Inter({ subsets: ["latin"] })

// Update the metadata object with more SEO-friendly values
export const metadata: Metadata = {
  title: {
    default: "Houston Mobile Notary Pros | Professional Notary Services",
    template: "%s | Houston Mobile Notary Pros",
  },
  description:
    "Professional mobile notary services in the Greater Houston area. Available 7 days a week with flexible scheduling and competitive rates.",
  keywords: ["mobile notary", "houston notary", "loan signing", "notary public", "notary services", "texas notary"],
  authors: [{ name: "Houston Mobile Notary Pros" }],
  creator: "Houston Mobile Notary Pros",
  publisher: "Houston Mobile Notary Pros",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  metadataBase: new URL("https://houstonmobilenotarypros.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://houstonmobilenotarypros.com",
    title: "Houston Mobile Notary Pros | Professional Notary Services",
    description:
      "Professional mobile notary services in the Greater Houston area. Available 7 days a week with flexible scheduling and competitive rates.",
    siteName: "Houston Mobile Notary Pros",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Houston Mobile Notary Pros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Houston Mobile Notary Pros | Professional Notary Services",
    description:
      "Professional mobile notary services in the Greater Houston area. Available 7 days a week with flexible scheduling and competitive rates.",
    creator: "@HoustonNotary", // Replace with your actual Twitter handle
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "your-google-site-verification", // Replace with your actual verification code
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

// Update the RootLayout to include the LocalBusinessSchema
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CacheProvider>
            <PreloadAssets />
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <LocalBusinessSchema />
            <PendingSubmissionsProcessor />
            <ApiHealthMonitor />
          </CacheProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'