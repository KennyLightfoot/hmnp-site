import type { ReactNode } from 'react'
import StickyMobileCTA from '@/components/ui/StickyMobileCTA'

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pb-28 md:pb-0">
        {children}
      </div>
      <StickyMobileCTA
        headline="Lock in your mobile notary today"
        subheadline="Professional agents available 7 days a week"
        analyticsContext="sticky_mobile_lp"
      />
    </>
  )
}

