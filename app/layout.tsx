import type { Metadata, Viewport } from "next"
import { dmSerifDisplay, inter } from './fonts'
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import Script from "next/script"
import GAPathTracker from "@/components/analytics/GAPathTracker"
import GAConversionEvents from "@/components/analytics/GAConversionEvents"
import dynamic from 'next/dynamic'
import Analytics from '@/components/Analytics'
import SchemaInitializer from '@/components/SchemaInitializer'
import AttributionInit from '@/components/analytics/AttributionInit'
import dynamic from 'next/dynamic'

const AIChatWidget = dynamic(() => import('@/components/ai/AIChatWidget'), {
  ssr: false,
  loading: () => null,
})

// Fonts now provided via CSS variables for Tailwind

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#002147" },
    { media: "(prefers-color-scheme: dark)", color: "#002147" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
    template: "%s | Houston Mobile Notary Pros"
  },
  description: "Professional mobile notary services in Houston. Same-day appointments, loan signings, real estate closings, and more. Licensed, insured, and trusted by thousands.",
  keywords: ["Houston notary", "mobile notary", "loan signing", "real estate notary", "document notarization", "same day notary"],
  authors: [{ name: "Houston Mobile Notary Pros" }],
  creator: "Houston Mobile Notary Pros LLC",
  publisher: "Houston Mobile Notary Pros LLC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://houstonmobilenotarypros.com'),
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
  verification: {},
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
}

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://houstonmobilenotarypros.com/#organization",
  name: "Houston Mobile Notary Pros LLC",
  url: "https://houstonmobilenotarypros.com",
  logo: "https://houstonmobilenotarypros.com/logo.png",
  sameAs: [
    "https://www.facebook.com/HoustonMobileNotaryPros/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-832-617-4285",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: ["en"]
    }
  ]
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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <body>
        {/* Consent Mode v2 default (denied) + updater hook. Must run before GTM. */}
        <Script id="consent-mode-default" strategy="beforeInteractive">
          {`
            (function() {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              // Default: denied until user grants via banner
              gtag('consent', 'default', {
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'ad_storage': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'granted',
                'security_storage': 'granted'
              });
              // Optional: expose updater for your banner to call
              window.hmnpConsentUpdate = function(granted) {
                try {
                  gtag('consent', 'update', granted ? {
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'ad_storage': 'granted',
                    'analytics_storage': 'granted'
                  } : {
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'ad_storage': 'denied',
                    'analytics_storage': 'denied'
                  });
                } catch(_) {}
              };
            })();
          `}
        </Script>
        {gtmId ? (
          <>
            <Script id="gtm-base" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `}
            </Script>
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
              }}
            />
          </>
        ) : null}
        <Suspense>
          <Analytics />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <AttributionInit />
        {/* Initialize enhanced schema in browser */}
        <SchemaInitializer />
        {/* Google Analytics / Google Ads via gtag.js (no GTM) */}
        {(() => {
          const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || '';
          const adsAccountId = adsConversionId ? adsConversionId.split('/') [0] : '';
          const gaId = process.env.NEXT_PUBLIC_GA_ID;
          const shouldLoadGtagDirect = (gaId || adsAccountId) && !process.env.NEXT_PUBLIC_GTM_ID;
          if (!shouldLoadGtagDirect) return null;
          const gtagId = gaId || adsAccountId;
          if (!gtagId) return null; // Safety check
          return (
          <Suspense fallback={null}>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
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
          <Suspense fallback={<div className="h-16 bg-white border-b animate-pulse" />}>
            <LazyHeader />
          </Suspense>
          
          <main className="min-h-dvh">
            <Suspense fallback={
              <div className="container mx-auto px-4 py-12 space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-64 bg-gray-100 rounded-2xl" />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="h-48 bg-gray-100 rounded-2xl" />
                  <div className="h-48 bg-gray-100 rounded-2xl" />
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </main>
          
          <Suspense fallback={<div className="h-64 bg-gray-900 animate-pulse" />}>
            <LazyFooter />
          </Suspense>
        <AIChatWidget
          enableProactive={true}
          enableVoice={true}
          proactiveDelay={30000}
        />
        </Providers>
      </body>
    </html>
  )
}