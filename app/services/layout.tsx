import type { ReactNode } from 'react'
import StickyMobileCTA from '@/components/ui/StickyMobileCTA'

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pb-28 md:pb-0">
        {children}
      </div>
      <StickyMobileCTA
        headline="Have documents that need notarizing?"
        subheadline="Same-day mobile service across Houston"
        analyticsContext="sticky_mobile_services"
      />
    </>
  )
}

