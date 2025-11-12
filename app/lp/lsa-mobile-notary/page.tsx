"use client";

import LeadForm from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { getBusinessPhoneFormatted, getBusinessTel } from "@/lib/phone";
import Link from "next/link";

export default function LsaMobileNotaryLandingPage() {
  const phone = getBusinessPhoneFormatted();
  const tel = getBusinessTel();
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-secondary text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-wide">
              Google Local Services Ads • Verified Provider • Background Screened
            </span>
            <h1 className="mt-4 text-3xl md:text-5xl font-serif font-bold tracking-tight">
              Google LSA Mobile Notary — Book the Verified Team You Just Called.
            </h1>
            <p className="mt-4 text-white/90 text-base md:text-lg">
              You found us through Google&apos;s Local Services Ads. Finish the booking here to lock your verified notary. Same-day coverage, weekend availability, and Stripe deposit checkout.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/booking?source=lsa&serviceType=STANDARD_NOTARY" className="inline-flex">
                <Button className="bg-white text-secondary hover:bg-white/90 h-12 px-6">
                  Reserve My Notary
                </Button>
              </Link>
              <a href={`tel:${tel}`} className="inline-flex">
                <Button variant="outline" className="h-12 px-6 border-white/30 text-white hover:bg-white/10">
                  Call {phone}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-secondary">Why Google LSA Users Choose HMNP</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Verified Google background check and insurance on file</li>
                <li>• 20-mile radius included, automatic travel tiers beyond</li>
                <li>• Same-day response with live dispatch ETA tracking</li>
                <li>• Secure Stripe deposit to guarantee your appointment</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-secondary">Service Hours</h3>
              <p className="text-sm text-slate-700">
                Standard coverage 9 AM – 5 PM (Mon–Fri) and extended 7 AM – 9 PM daily. After-hours and weekend surcharges follow SOP v2.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-secondary">Coverage Snapshot</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• Texas City, League City, Friendswood, Pearland, Pasadena</li>
                <li>• Hospitals, senior care, title offices, in-home appointments</li>
                <li>• Loan signing specialists available on request</li>
              </ul>
            </section>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 md:p-10">
            <LeadForm
              apiEndpoint="/api/submit-ad-lead"
              tags={[
                "AdLead:GoogleLSA",
                "ServiceInterest:MobileNotary",
                "Channel:GoogleLSA",
                "Source:GoogleLocalServices"
              ]}
              customFields={{
                cf_ad_platform: "GoogleLocalServices",
                cf_ad_campaign_name: "LSA Mobile Notary",
                cf_ad_id: "google-lsa-mobile",
                estimated_value: "95",
              }}
              campaignName="Google LSA Mobile Notary"
              submitButtonText="Confirm My Notary"
              formTitle="Finish Scheduling Your LSA Request"
              formDescription="Complete the secure form to finalize your booking. Dispatch responds in minutes during service hours."
              successRedirectUrl="/thank-you-ads"
              trackingOverrides={{
                lead_source: "google_lsa",
                service_type: "mobile-notary",
                estimated_value: 95,
                campaign_name: "Google LSA Mobile Notary",
                ad_platform: "google_lsa",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

