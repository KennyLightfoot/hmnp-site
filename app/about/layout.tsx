import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | Houston Mobile Notary Pros",
  description:
    "Learn about Houston Mobile Notary Pros, our history, mission, and commitment to providing professional mobile notary services throughout the Houston area.",
  keywords:
    "about Houston Mobile Notary Pros, mobile notary company, notary history, professional notary, Houston notary service",
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
