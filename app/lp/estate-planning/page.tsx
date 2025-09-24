"use client"; // Required if using hooks like useSearchParams

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense
import Link from "next/link"

// This internal component is needed because useSearchParams can only be used in Client Components
function EstatePlanningLeadForm() {
  const searchParams = useSearchParams(); // Hooks can only be called in Client Components

  // --- Ad Specific Custom Fields (using friendly keys for your API endpoint) ---
  const adSpecificCustomFields: Record<string, string> = {
    cf_ad_platform: "GoogleAds", // or "Facebook", "Organic", etc.
    cf_ad_campaign_name: "Estate Planning Q3", // Specific to this campaign
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    cf_ad_keyword: searchParams?.get("keyword") || "", // Capture keyword for PPC
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:EstatePlanning",
    "ServiceInterest:EstatePlanning",
    "AdCampaign:EstatePlanningQ3",
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Your API endpoint for leads
      tags={adSpecificTags}
      customFields={adSpecificCustomFields}
      campaignName="Estate Planning Q3"
      successRedirectUrl="/booking?service=estate-planning&price=250" // Redirect to booking page with params
      formTitle="Plan Your Legacy with Confidence"
      formDescription="Fill out the form to book our convenient Estate Planning Notary Package."
      submitButtonText="Book My Appointment"
    />
  );
}

export default function EstatePlanningLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Mobile Notary for Your Estate Planning</h1>
        <p className="text-xl text-gray-600 mt-4">
          Professional, convenient, and compassionate handling of your most important documents.
        </p>
      </header>

      <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
          <EstatePlanningLeadForm />
        </Suspense>
      </section>

      <section className="mt-12 text-center text-gray-700">
        <h2 className="text-3xl font-semibold mb-6">Our Estate Planning Package Includes:</h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Up to 10 Documents</h3>
                <p>Notarization for Wills, Trusts, POAs, and more.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Up to 4 Signers</h3>
                <p>Ideal for individuals, couples, and family arrangements.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">We Come To You</h3>
                <p>Service at your home, office, or other preferred location.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Flexible Scheduling</h3>
                <p>Weekend and after-hours appointments are available.</p>
            </div>
        </div>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Why Choose Houston Mobile Notary Pros?</h2>
        <ul className="list-disc list-inside inline-block text-left text-gray-600 space-y-2">
          <li>Experienced with sensitive estate documents</li>
          <li>Detail-oriented and compliant with Texas law</li>
          <li>Punctual, professional, and discreet service</li>
          <li>NNA Certified and Background Screened</li>
        </ul>
      </section>

      <section className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          Want to learn more about our Estate Planning Package?
        </p>
        <Link 
          href="/services/estate-planning" 
          className="text-[#A52A2A] hover:underline font-medium"
        >
          View Detailed Service Information →
        </Link>
      </section>
    </div>
  );
} 