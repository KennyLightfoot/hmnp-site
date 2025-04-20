import type { Metadata } from "next"
import FAQClientPage from "./FAQClientPage"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Frequently Asked Questions | Houston Mobile Notary Pros",
  description:
    "Find comprehensive answers to common questions about mobile notary services, document requirements, pricing, scheduling, and legal compliance for notarizations in Houston.",
  keywords:
    "mobile notary FAQ, notary questions, Houston notary services, loan signing FAQ, notary requirements, notary pricing, document notarization, Texas notary laws",
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: "Frequently Asked Questions | Houston Mobile Notary Pros",
    description: "Find answers to common questions about Houston Mobile Notary Pros' services, pricing, scheduling, and requirements.",
    url: `${BASE_URL}/faq`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'FAQ for Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FAQ - Houston Mobile Notary Pros",
    description: "Got questions about mobile notary services in Houston? Find answers about pricing, ID requirements, scheduling, and more.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function FAQPage() {
  return <FAQClientPage />
}
