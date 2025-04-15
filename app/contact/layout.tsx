import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Houston Mobile Notary Pros",
  description:
    "Get in touch with Houston Mobile Notary Pros for all your mobile notary needs. We're here to answer your questions and provide professional service.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
