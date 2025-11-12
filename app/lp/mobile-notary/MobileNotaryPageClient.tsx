'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import PrefetchBooking from '@/components/PrefetchBooking';
import { Button } from '@/components/ui/button';
import { getBusinessPhoneFormatted, getBusinessTel } from '@/lib/phone';
import LeadForm from '@/components/lead-form';

const EstimatorStrip = dynamic(() => import('@/components/EstimatorStrip'), {
  ssr: false,
  loading: () => (
    <div className="py-8 text-center text-sm text-muted-foreground">Loading estimator…</div>
  ),
});

const MicroTestimonials = dynamic(() => import('@/components/MicroTestimonials'), {
  loading: () => <div className="py-12" />,
});

const mobileLeadFormProps = {
  apiEndpoint: '/api/submit-ad-lead',
  tags: ['AdLead:PaidSearch', 'ServiceInterest:MobileNotary', 'Channel:Google'],
  customFields: {
    cf_ad_platform: 'GoogleAds',
    cf_ad_campaign_name: 'Mobile Notary Paid Search',
    cf_ad_id: 'google-search-mobile-notary',
    estimated_value: '95',
  },
  campaignName: 'Mobile Notary Paid Search',
  successRedirectUrl: '/thank-you-ads',
  submitButtonText: 'Get Your Instant Quote',
  formTitle: 'Lock In Your Mobile Notary',
  formDescription:
    "Tell us where and when you need us. We confirm within minutes during service hours.",
  trackingOverrides: {
    lead_source: 'google_ads',
    service_type: 'mobile-notary',
    estimated_value: 95,
    campaign_name: 'Mobile Notary Paid Search',
    ad_platform: 'google_ads',
  },
} as const;

export default function MobileNotaryPageClient() {
  const phone = getBusinessPhoneFormatted();
  const tel = getBusinessTel();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-wide text-white/75">
              Greater Houston • NNA Certified • Insured
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-serif font-bold leading-tight">
              Mobile Notary Near You — Transparent, On-Time, Professional.
            </h1>
            <p className="mt-4 text-white/90 text-base md:text-lg">
              From $75. 20-mile radius included, tiered travel beyond. Same-day & after-hours options
              with guaranteed deposit to hold your slot.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?serviceType=STANDARD_NOTARY" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">
                  Book Mobile Notary
                </Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button
                  variant="outline"
                  className="h-12 px-6 border-white/30 text-white hover:bg-white/10"
                >
                  Call {phone}
                </Button>
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
                Same-day windows
              </span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
                Deposit secures your notary
              </span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
                20-mile radius included
              </span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
                4.9★ rated team
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-6">
        <EstimatorStrip defaultMode="MOBILE" />
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">Included Service Radius</h3>
            <p className="mt-2 text-sm text-black/70">
              20 miles from 77591 included. Travel tiers auto-calculate: 21–30 mi +$25, 31–40 mi
              +$45, 41–50 mi +$65 (max).
            </p>
          </div>
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">Pricing &amp; Deposits</h3>
            <p className="mt-2 text-sm text-black/70">
              Standard $75 base. 50% deposit for bookings ≥$100, same-day, after-hours, or loan
              signing requests. Clear add-ons for witnesses, printing, and scanning.
            </p>
          </div>
          <div className="p-5 border rounded-xl shadow-sm">
            <h3 className="font-semibold text-secondary">On-Time Guarantee</h3>
            <p className="mt-2 text-sm text-black/70">
              Live dispatch monitors every assignment. If we miss the arrival window without notice,
              an automatic 15% service credit applies.
            </p>
          </div>
        </div>
      </section>

      <section id="form" className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-secondary">
                Request Your Mobile Notary Now
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Submit the details below and dispatch confirms within minutes (7 AM–9 PM). Deposits
                handled securely via Stripe.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 md:p-10">
              <Suspense fallback={<div className="text-center py-10 text-slate-500">Loading form…</div>}>
                <LeadForm {...mobileLeadFormProps} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-secondary">What to Expect</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Confirmation call/text within 15 minutes during service hours.</li>
              <li>• Notary dispatch with live ETA updates and SMS reminders.</li>
              <li>• Secure deposit checkout via Stripe (Tap to Pay or link).</li>
              <li>• Closeout checklist: journal entry, seal photo, client confirmation.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-secondary">Perfect For</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Hospitals, senior living, and in-home signings.</li>
              <li>• Power of attorney, estate planning, and adoption documents.</li>
              <li>• Title &amp; escrow mobile closings (loan signing specialist available).</li>
              <li>• Businesses needing after-hours or weekend coverage.</li>
            </ul>
          </div>
        </div>
      </section>

      <MicroTestimonials />
      <PrefetchBooking />
    </div>
  );
}

