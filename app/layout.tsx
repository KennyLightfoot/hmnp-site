import type React from "react"
import type { Metadata } from "next"
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
  },
    generator: 'v0.dev'
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
        <meta name="facebook-domain-verification" content="z1f6t494uyp7hjnin4ca8fz1u9q51r" />
        {/* Facebook Pixel Base Code */}
        <Script id="fb-pixel-base" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID'); // TODO: Replace YOUR_PIXEL_ID
            fbq('track', 'PageView');
          `}
        </Script>
        {/* End Facebook Pixel Base Code */}

        {/* LinkedIn Insight Tag Base Code */}
        <Script id="linkedin-insight-tag" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "YOUR_LINKEDIN_PARTNER_ID"; // TODO: Replace YOUR_LINKEDIN_PARTNER_ID
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
        {/* End LinkedIn Insight Tag Base Code */}
      </head>
      <body className={`${inter.className} bg-white`}>
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
          {/* <Analytics /> */}
        </Providers>
      </body>
    </html>
  )
}


import './globals.css'