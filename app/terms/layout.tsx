import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Houston Mobile Notary Pros",
  description:
    "Our terms of service outline the conditions for using our mobile notary services, including scheduling, cancellations, and legal limitations.",
  keywords: "terms of service, legal terms, notary terms, service conditions, cancellation policy",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
