import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Houston Mobile Notary Pros",
  description:
    "Our privacy policy explains how we collect, use, and protect your personal information when you use our mobile notary services.",
  keywords: "privacy policy, data protection, notary privacy, information security, personal data",
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
