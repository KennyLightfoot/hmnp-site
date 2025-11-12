import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import PrefetchBooking from '@/components/PrefetchBooking'
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone'
import LeadForm from '@/components/lead-form'

const EstimatorStrip = dynamic(() => import('@/components/EstimatorStrip'), {
  ssr: false,
  loading: () => <div className="py-10 text-center text-sm text-muted-foreground">Loading estimator…</div>,
})

const MicroTestimonials = dynamic(() => import('@/components/MicroTestimonials'), {
  loading: () => <div className="py-12" />,
})

const SameDaySlotCounter = dynamic(() => import('@/components/urgency/same-day-slot-counter'), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Checking availability…</div>,
})

const ronLeadFormProps = {
  apiEndpoint: '/api/submit-ad-lead',
  tags: ['AdLead:RON', 'Channel:GoogleAds', 'ServiceInterest:RON'],
  customFields: {
    cf_ad_platform: 'GoogleAdsRON',
    cf_ad_campaign_name: 'RON Instant Campaign',
    cf_ad_id: 'google-search-ron',
    estimated_value: '45',
  },
  campaignName: 'RON Instant Campaign',
  successRedirectUrl: '/thank-you-ads',
  submitButtonText: 'Start My Online Notary',
  formTitle: 'Need a Notary in 15–30 Minutes?',
  formDescription: 'Complete the form and we send your Proof.com session link right away.',
  trackingOverrides: {
    lead_source: 'google_ads',
    service_type: 'remote-online-notarization',
    estimated_value: 45,
    campaign_name: 'RON Instant Campaign',
    ad_platform: 'google_ads',
  },
} as const

export default function RonLP() {
  const phone = getBusinessPhoneFormatted()
  const tel = getBusinessTel()
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-secondary/95 to-secondary text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-wide text-white/75">
              Texas Compliant • Proof.com Platform • Recorded Sessions
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-serif tracking-tight">
              Remote Online Notarization — Often Completed in 15–30 Minutes.
            </h1>
            <p className="mt-3 text-base md:text-lg text-white/90">
              From $35. Credential analysis + KBA + audio/video recording included. After-hours coverage available with quick deposit checkout.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?serviceType=RON_SERVICES" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">Start Online Notary</Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  Call {phone}
                </Button>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Proof.com credential analysis</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">KBA + ID validation</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">Session recording archived 7 years</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8">
        <EstimatorStrip defaultMode="RON" />
      </section>

      <section className="border-b py-8">
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-4">
          <div className="text-sm text-slate-700">Available statewide • Live human support • Deposits processed via Stripe</div>
          <div className="flex-1" />
          <SameDaySlotCounter serviceType="RON_SERVICES" className="bg-white border border-slate-200" refreshMs={60000} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">What You Need</h3>
            <p className="text-sm text-black/70 mt-2">Valid government ID, device with camera/mic, stable internet ≥10 Mbps, and a quiet space.</p>
          </div>
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">Pricing & Deposits</h3>
            <p className="text-sm text-black/70 mt-2">From $35 (session + first seal). Additional seals $5. After-hours surcharge $50. Deposit required for packages ≥$100 or after-hours.</p>
          </div>
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">Compliance Covered</h3>
            <p className="text-sm text-black/70 mt-2">Proof.com credential analysis, KBA, and audio/video recording archived for 7 years with secure storage.</p>
          </div>
        </div>
      </section>

      <section id="form" className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-secondary">Ready to Notarize Online?</h2>
              <p className="mt-3 text-lg text-slate-600">
                Fill in your details and we send your secure RON session link. Average go-live in 15–30 minutes during peak hours.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 md:p-10">
              <Suspense fallback={<div className="text-center py-10 text-slate-500">Loading secure form…</div>}>
                <LeadForm {...ronLeadFormProps} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <MicroTestimonials />
      <PrefetchBooking />
    </div>
  )
}