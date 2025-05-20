import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Request a Callback | Houston Mobile Notary Pros",
  description:
    "Need to speak with us directly? Request a callback from Houston Mobile Notary Pros for your notary service needs. Quick and convenient.",
  keywords: "request callback, schedule call notary, Houston notary callback, mobile notary call request",
  alternates: {
    canonical: '/request-a-call',
  },
  openGraph: {
    title: "Request a Callback - Houston Mobile Notary Pros",
    description: "Easily request a callback from our expert notary team. We're here to help with all your notarization questions and service bookings.",
    url: `${BASE_URL}/request-a-call`,
    siteName: 'Houston Mobile Notary Pros',
  },
};
