import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Houston Mobile Notary Pros - Professional Mobile Notary Services",
  description:
    "Professional mobile notary service in Houston, TX. On-site notarization, remote online notarization (RON), and loan signing specialists. Available 7am-9pm daily.",
  keywords:
    "mobile notary Houston, notary services Texas, RON remote notarization, loan signing agent, document notarization",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Houston Mobile Notary Pros",
  },
  formatDetection: {
    telephone: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  openGraph: {
    title: "Houston Mobile Notary Pros - Professional Mobile Notary Services",
    description:
      "Professional mobile notary service in Houston, TX. On-site notarization, remote online notarization (RON), and loan signing specialists.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Houston Mobile Notary Pros - Professional Mobile Notary Services",
    description:
      "Professional mobile notary service in Houston, TX. On-site notarization, remote online notarization (RON), and loan signing specialists.",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HMNP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#91a3b0" />
        <meta name="theme-color" content="#91a3b0" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
