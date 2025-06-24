import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "./providers"
import { StructuredData } from "@/components/structured-data"
import { Toaster } from "@/components/ui/toaster"
import { GoogleAnalytics } from '@next/third-parties/google'
import { log } from "console"
import { headers } from 'next/headers'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
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
    other: {
      'facebook-domain-verification': 'z1f6t494uyp7hjnin4ca8fz1u9q51r',
    },
  },
    generator: 'v0.dev',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'HMNP',
    'application-name': 'HMNP',
    'msapplication-TileColor': '#0066cc',
    'theme-color': '#0066cc',
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0066cc' },
    { media: '(prefers-color-scheme: dark)', color: '#0066cc' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-nonce') || "";

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-57x57.png" />
        
        {/* Apple Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphoneplus_splash.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro1_splash.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro3_splash.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro2_splash.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white`}>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1459938351663284');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}} 
               src="https://www.facebook.com/tr?id=1459938351663284&ev=PageView&noscript=1" />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PMHB36X5');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* LinkedIn Insight Tag */}
        <Script id="linkedin-insight-tag" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "514942430";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])}; window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}} 
               src="https://px.ads.linkedin.com/collect/?pid=514942430&fmt=gif" />
        </noscript>
        {/* End LinkedIn Insight Tag */}

        {/* Google Ads Conversion Tracking */}
        <Script id="google-ads" strategy="afterInteractive">
          {`
            // Google Ads Global Site Tag will be configured in GTM
            // Or add your Google Ads conversion ID here when available
            // Example: gtag('config', 'AW-CONVERSION_ID');
          `}
        </Script>
        {/* End Google Ads Conversion Tracking */}

        {/* Yelp Conversion Tracking */}
        <Script id="yelp-tracking" strategy="afterInteractive">
          {`
            // Yelp tracking will be added when you provide the Yelp tracking ID
            // Contact Yelp Ads support for your specific tracking code
            // Example format: yelp_conversion_id = "YOUR_YELP_TRACKING_ID";
          `}
        </Script>
        {/* End Yelp Conversion Tracking */}
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PMHB36X5"
                  height="0" width="0" style={{display: 'none', visibility: 'hidden'}}></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <Providers>
          {/* If using next/third-parties for Google Analytics, add GA component here */}
          {/* Example: <GoogleAnalytics gaId="YOUR_GA_ID" /> */}
          <GoogleAnalytics gaId="G-EXWGCN0D53" />
          <Header />
          <main>{children}</main>
          <Footer />
          <StructuredData nonce={nonce} />
          {/* <SpeedInsights /> */}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}


import './globals.css'