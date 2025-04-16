import type { Metadata } from "next"
import FAQClientPage from "./FAQClientPage"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Houston Mobile Notary Pros",
  description:
    "Find comprehensive answers to common questions about mobile notary services, document requirements, pricing, scheduling, and legal compliance for notarizations in Houston.",
  keywords:
    "mobile notary FAQ, notary questions, Houston notary services, loan signing FAQ, notary requirements, notary pricing, document notarization, Texas notary laws",
  openGraph: {
    title: "Frequently Asked Questions | Houston Mobile Notary Pros",
    description: "Find answers to common questions about our mobile notary services in Houston and surrounding areas.",
    url: "/faq",
    type: "website",
  },
}

export default function FAQPage() {
  return <FAQClientPage />
}
