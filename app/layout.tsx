import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "./providers"
import { StructuredData } from "@/components/structured-data"
import type { Metric } from 'web-vitals'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { log } from "console"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Houston Mobile Notary Pros",
    default: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
  },
  description:
    "Professional mobile notary services in Houston, Galveston, Pearland, and surrounding areas. We come to you for all your notarization needs, including loan signings, wills, POAs, and more.",
  keywords: "mobile notary, Houston notary, notary public, loan signing agent, traveling notary, notary services",
  authors: [{ name: "Houston Mobile Notary Pros" }],
  creator: "Houston Mobile Notary Pros",
  publisher: "Houston Mobile Notary Pros",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://houstonmobilenotarypros.com/",
    siteName: "Houston Mobile Notary Pros",
    title: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
    description:
      "Professional mobile notary services in Houston and surrounding areas. We come to you for all your notarization needs.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Houston Mobile Notary Pros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
    description:
      "Professional mobile notary services in Houston and surrounding areas. We come to you for all your notarization needs.",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "verification_token",
    yandex: "verification_token",
    yahoo: "verification_token",
  },
    generator: 'v0.dev'
}

export function reportWebVitals(metric: Metric) {
  // Use `window.gtag` if you initialized Google Analytics snippet directly
  // window.gtag('event', name, { ... });

  // Send to any other analytics endpoint here
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-white`}>
        <Providers>
          {/* If using next/third-parties for Google Analytics, add GA component here */}
          {/* Example: <GoogleAnalytics gaId="YOUR_GA_ID" /> */}
          <Header />
          <main>{children}</main>
          <Footer />
          <StructuredData />
          {/* <SpeedInsights /> */}
          <Toaster />
          {/* <Analytics /> */}
        </Providers>
      </body>
    </html>
  )
}


import './globals.css'