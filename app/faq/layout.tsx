import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Houston Mobile Notary Pros",
  description:
    "Find answers to common questions about mobile notary services, document requirements, pricing, scheduling, and legal compliance for notarizations in Houston.",
  keywords:
    "mobile notary FAQ, notary questions, Houston notary services, loan signing FAQ, notary requirements, notary pricing",
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
