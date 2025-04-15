import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Service Area | Houston Mobile Notary Pros",
  description:
    "View our service area map covering Houston and surrounding areas within a 30-mile radius of ZIP 77591. Check if your location is within our coverage area.",
  keywords:
    "mobile notary service area, Houston notary coverage, Texas City notary, notary travel radius, notary travel fees",
}

export default function ServiceAreaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
