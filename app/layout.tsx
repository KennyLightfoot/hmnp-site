import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import Script from "next/script"
import GAPathTracker from "@/components/analytics/GAPathTracker"
import GAConversionEvents from "@/components/analytics/GAConversionEvents"
import { LoadingSpinner } from "@/components/ui/loading-states"
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
    template: "%s | Houston Mobile Notary Pros"
  },
  description: "Professional mobile notary services in Houston. Same-day appointments, loan signings, real estate closings, and more. Licensed, insured, and trusted by thousands.",
  keywords: ["Houston notary", "mobile notary", "loan signing", "real estate notary", "document notarization", "same day notary"],
  authors: [{ name: "Houston Mobile Notary Pros" }],
  creator: "Houston Mobile Notary Pros",
  publisher: "Houston Mobile Notary Pros",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://houstonmobilenotarypros.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://houstonmobilenotarypros.com',
    title: 'Houston Mobile Notary Pros | Professional Mobile Notary Services',
    description: 'Professional mobile notary services in Houston. Same-day appointments, loan signings, real estate closings, and more.',
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Houston Mobile Notary Pros | Professional Mobile Notary Services',
    description: 'Professional mobile notary services in Houston. Same-day appointments, loan signings, real estate closings, and more.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

// Lazy load heavy components
const LazyHeader = dynamic(() => import('@/components/header'), {
  loading: () => <div className="h-16 bg-white border-b animate-pulse" />
})

const LazyFooter = dynamic(() => import('@/components/footer'), {
  loading: () => <div className="h-64 bg-gray-900 animate-pulse" />
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <Script id="gtm-base" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}</Script>
      )}
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {/* Google Analytics / Google Ads via gtag.js (no GTM) */}
        {(() => {
          const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '';
          const adsAccountId = adsConversionId ? adsConversionId.split('/')[0] : '';
          const gaId = process.env.NEXT_PUBLIC_GA_ID;
          const shouldLoadGtagDirect = (gaId || adsAccountId) && !process.env.NEXT_PUBLIC_GTM_ID;
          if (!shouldLoadGtagDirect) return null;
          return (
          <Suspense fallback={null}>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId || adsAccountId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${gaId ? `gtag('config', '${gaId}', { page_path: window.location.pathname });` : ''}
                ${adsAccountId ? `gtag('config', '${adsAccountId}');` : ''}
              `}
            </Script>
            <GAPathTracker />
            <GAConversionEvents />
          </Suspense>
          );
        })()}
        <Providers>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <LazyHeader />
          </Suspense>
          
          <main className="min-h-screen">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {children}
            </Suspense>
          </main>
          
          <Suspense fallback={<div className="h-64 bg-gray-900 animate-pulse" />}>
            <LazyFooter />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}