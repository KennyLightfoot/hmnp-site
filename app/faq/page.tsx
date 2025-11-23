import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import FAQClientPage from "@/components/faq/FAQClientPageOptimized"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Mobile Notary FAQ",
  description:
    "Answers to the most common questions about Houston Mobile Notary Pros—pricing, ID requirements, scheduling, travel fees, and remote online notarization.",
  keywords: [
    "mobile notary FAQ",
    "Houston notary questions",
    "loan signing FAQ",
    "notary requirements Houston",
  ],
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: "Mobile Notary FAQ",
    description: "Get quick answers about pricing, IDs, scheduling, travel, and RON with Houston Mobile Notary Pros.",
    url: `${BASE_URL}/faq`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
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
    title: "Mobile Notary FAQ",
    description: "Everything you need to know about booking a mobile or online notary in Houston.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function FAQPage() {
  return (
    <>
      <FAQClientPage />
      <section className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl bg-white shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#002147] mb-3 text-center">Still have questions?</h2>
            <p className="text-gray-600 text-center mb-6">
              Jump to our most-requested pages for pricing, booking, and local availability.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { href: "/pricing", label: "See transparent pricing" },
                { href: "/booking", label: "Book an appointment" },
                { href: "/services/loan-signing-specialist", label: "Loan signing details" },
                { href: "/services/remote-online-notarization", label: "Remote online notarization" },
                { href: "/service-areas/houston", label: "Houston service map" },
                { href: "/service-areas/league-city", label: "League City availability" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"
                >
                  <span className="text-[#002147] font-medium">{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#A52A2A]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
