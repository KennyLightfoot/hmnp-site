import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'How Remote Online Notarization (RON) Works | Step-by-Step Guide | HMNP',
  description:
    'Learn how Remote Online Notarization (RON) works with our step-by-step guide. Secure, convenient, and legally compliant RON services in Texas. Get notarized online from anywhere.',
  keywords:
    'RON process, remote online notarization guide, how RON works, online notary Texas, digital notarization steps, remote notary process, RON requirements, electronic notarization',
  alternates: {
    canonical: '/ron/how-it-works',
  },
  openGraph: {
    title: 'How Remote Online Notarization Works | Complete RON Guide',
    description: 'Discover how RON works with our comprehensive step-by-step guide. Secure, convenient online notarization from the comfort of your home or office.',
    url: `${BASE_URL}/ron/how-it-works`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image-ron.jpg',
        width: 1200,
        height: 630,
        alt: 'Remote Online Notarization Process Guide - Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Remote Online Notarization Works | Complete RON Guide',
    description: 'Learn the RON process step-by-step. Secure, convenient online notarization available 24/7 in Texas.',
    images: [`${BASE_URL}/og-image-ron.jpg`],
  },
}