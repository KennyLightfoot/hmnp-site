"use client";

import LeadForm from "@/components/lead-form";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Shield, MapPin, FileText, Building2, Phone, Star, BadgeCheck, Rocket } from "lucide-react";
import { trackPhoneClick } from "@/lib/tracking";
import ServiceSchema from "@/components/schema/ServiceSchema";
import EnhancedFAQSchema from "@/components/enhanced-faq-schema";
const LazyEnhancedFAQSchema = dynamic(() => import("@/components/enhanced-faq-schema"), { ssr: false });
const Testimonials = dynamic(async () => import("./testimonials.client").then(m => m.default), { ssr: false, loading: () => <div className="container mx-auto px-4 py-12"><div className="grid md:grid-cols-3 gap-6"><div className="animate-pulse h-40 bg-gray-100 rounded-xl" /><div className="animate-pulse h-40 bg-gray-100 rounded-xl" /><div className="animate-pulse h-40 bg-gray-100 rounded-xl" /></div></div> });
import { useMemo } from "react";

function StandardServicesLeadForm() {
  const searchParams = useSearchParams();

  const adSpecificCustomFields: Record<string, string> = {
    cf_ad_platform: "GoogleAds",
    cf_ad_campaign_name: "Standard Notary Services",
    cf_ad_id: searchParams?.get("ad_id") || "",
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    cf_ad_keyword: searchParams?.get("keyword") || "",
  };

  const adSpecificTags = [
    "AdLead:GoogleAds",
    "ServiceInterest:StandardNotary",
    "AdCampaign:StandardNotaryServices",
    "Status:New_Ad_Lead",
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead"
      tags={adSpecificTags}
      customFields={adSpecificCustomFields}
      campaignName="Standard Notary Services"
      successRedirectUrl="/thank-you-ads"
      formTitle="Book a Professional Notary"
      formDescription="Same‑day mobile notary, loan signings, and online notarization. Tell us what you need—get a fast quote."
      submitButtonText="Get My Quote"
    />
  );
}

export default function StandardServicesLandingPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const abVariant = params.get('ab');
  const isVariantA = abVariant === 'variant_a';
  const headline = isVariantA ? 'Skip the Trip — We Come To You' : 'Reliable Notary Services';
  const subCtaText = isVariantA ? 'Get My Fast Quote' : 'Get Started';
  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Schema */}
      <ServiceSchema
        serviceName="Houston Notary Services"
        description="Certified mobile notary, loan signing, and online notarization (RON). Same‑day appointments in Greater Houston."
        price="$75"
        serviceType="ProfessionalService"
        serviceUrl="/lp/standard-services"
        areaServed={["Houston, TX", "Pearland, TX", "Sugar Land, TX", "Greater Houston Area"]}
        features={["Same‑day appointments", "Licensed, bonded, insured", "Mobile & online options"]}
      />
      <LazyEnhancedFAQSchema />
      <header className="bg-gradient-to-r from-[#002147] to-[#003366] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full text-sm font-medium mb-6">
                Standard Notary Services (Greater Houston)
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {headline}
                <span className="text-[#A52A2A]"> When and Where You Need</span>
              </h1>
              <p className="text-lg text-blue-100 mb-6">
                Mobile notary to your location, online notarization, and certified loan signings. Book same‑day appointments.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  {subCtaText}
                </a>
                <a href="tel:+18326174285" className="border-2 border-white text-white hover:bg-white hover:text-[#002147] px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center" onClick={() => trackPhoneClick('lp_standard_services_hero')}>
                  Call (832) 617-4285
                </a>
                <a href="sms:+18326174285" className="border-2 border-white/70 text-white/90 hover:bg-white hover:text-[#002147] px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  Text Us
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-[#A52A2A]" /> 4.9★ average rating</div>
                <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#A52A2A]" /> Licensed • Bonded • Insured</div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#A52A2A]" /> On‑Time Guarantee</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Us</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A]" />
                  <span className="text-blue-100 text-sm">Certified & Insured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-[#A52A2A]" />
                  <span className="text-blue-100 text-sm">Same‑Day Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#A52A2A]" />
                  <span className="text-blue-100 text-sm">We Come To You</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#A52A2A]" />
                  <span className="text-blue-100 text-sm">Real Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Compact Pricing Anchor */}
        <section className="py-6 bg-amber-50 border-y border-amber-100">
          <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-amber-900"><Rocket className="h-4 w-4" /> From $75 • 20–30 mi included • After‑hours +$25 • Priority arrival available</div>
            <div className="flex items-center gap-3">
              <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-4 py-2 rounded-md font-semibold">Get a fast quote</a>
              <a href="tel:+18326174285" className="text-[#002147] underline" onClick={() => trackPhoneClick('lp_standard_services_pricing_bar')}>Click to call</a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="font-semibold text-[#002147] mb-2">1) Tell us what you need</div>
                <p className="text-gray-600">Share document type, signers, location, and timing. Takes ~60 seconds.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="font-semibold text-[#002147] mb-2">2) Get a quick quote</div>
                <p className="text-gray-600">We reply in 10–20 minutes during service hours with clear pricing.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="font-semibold text-[#002147] mb-2">3) We come to you or meet online</div>
                <p className="text-gray-600">On‑time arrival, verified ID, and smooth notarization. Guaranteed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Services */}
        <section className="py-14 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#002147] mb-3">Our Core Services</h2>
              <p className="text-gray-600">Transparent pricing. Professional, on‑time service. Mobile and online options available.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-6 w-6 text-[#002147]" />
                  <h3 className="text-lg font-semibold text-[#002147]">General Notarization</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Acknowledgments, Jurats, Affidavits</li>
                  <li>• Healthcare, POA, School forms</li>
                  <li>• Business & personal documents</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-6 w-6 text-[#002147]" />
                  <h3 className="text-lg font-semibold text-[#002147]">Loan Signing</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Purchases, Refinances, HELOCs</li>
                  <li>• NNA Certified, Scan‑backs</li>
                  <li>• Title & Lender friendly</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-[#002147]" />
                  <h3 className="text-lg font-semibold text-[#002147]">Online Notary (RON)</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Secure remote video notarization</li>
                  <li>• Same‑day availability</li>
                  <li>• Texas‑compliant platform</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-gray-50">
          <Testimonials />
        </section>

        {/* Local proof */}
        <section className="py-10">
          <div className="container mx-auto px-4 text-center">
            <div className="text-sm text-gray-600">Trusted by clients in <strong>Houston</strong>, <strong>Pearland</strong>, <strong>Sugar Land</strong>, and surrounding areas.</div>
          </div>
        </section>

        {/* Form section enhancements */}
        <section id="form" className="py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#002147]">Tell Us What You Need</h3>
                <p className="text-gray-600">We reply within 10–20 minutes during service hours.</p>
              </div>
              <Suspense fallback={<div className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-100 rounded w-1/3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-100 rounded" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                  <div className="h-24 bg-gray-100 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>}>
                <StandardServicesLeadForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#002147]"><Rocket className="h-4 w-4" /> Fast quote • Same‑day available</div>
          <div className="flex items-center gap-2">
            <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-4 py-2 rounded-md font-semibold">Get a quote</a>
            <a href="tel:+18326174285" className="text-[#002147] underline" onClick={() => trackPhoneClick('lp_standard_services_sticky_bar')}>Call now</a>
          </div>
        </div>
      </div>
    </div>
  );
}


