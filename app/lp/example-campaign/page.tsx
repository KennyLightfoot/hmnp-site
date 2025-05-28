"use client"; // Required if using hooks like useSearchParams

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense

// This internal component is needed because useSearchParams can only be used in Client Components
function CampaignLeadForm() {
  const searchParams = useSearchParams(); // Hooks can only be called in Client Components

  // --- Ad Specific Custom Fields (using friendly keys for your API endpoint) ---
  // These keys should match what your /api/submit-ad-lead expects in customFieldsFromProps
  const adSpecificCustomFields: Record<string, string> = {
    // This value will be specific to this landing page/campaign
    cf_ad_platform: "ExamplePlatform", // e.g., "Facebook", "GoogleAds", "LinkedIn"
    cf_ad_campaign_name: "Example Campaign Name Fall 2024", // Specific to this campaign
    
    // You can try to get ad_ids or other specific params if they are in the URL
    // Example: if URL is /lp/example-campaign?ad_id=12345
    cf_ad_id: searchParams.get("ad_id") || "", 
    cf_ad_group_id: searchParams.get("adgroup_id") || "",
    // cf_ad_keyword: searchParams.get("keyword") || "", // If applicable
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:ExamplePlatform", // Matches cf_ad_platform
    "AdCampaign:ExampleCampaignNameFall2024", // Matches cf_ad_campaign_name
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Point to your new API endpoint
      tags={adSpecificTags}
      customFields={adSpecificCustomFields} // Pass the ad-specific (friendly key) custom fields
      campaignName="Example Campaign Name Fall 2024" // This is also passed in the payload
      successRedirectUrl="/thank-you-ads" // Or a more specific thank-you page
      formTitle="Special Offer: Example Campaign!"
      formDescription="Fill out your details below to claim your exclusive offer from our Example Campaign."
      submitButtonText="Claim Your Offer Now"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function ExampleCampaignLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Exclusive Offer from Our Example Campaign!</h1>
        <p className="text-xl text-gray-600 mt-4">
          Don't miss out on this limited-time opportunity. Get the best notary services in Houston.
        </p>
      </header>

      <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        {/* Wrap the form in Suspense because CampaignLeadForm uses useSearchParams */}
        <Suspense fallback={<div className="text-center p-8">Loading form, please wait...</div>}>
          <CampaignLeadForm />
        </Suspense>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Why Choose Houston Mobile Notary Pros?</h2>
        <ul className="list-disc list-inside inline-block text-left text-gray-600">
          <li>Fast and Reliable Service</li>
          <li>Experienced & Certified Notaries</li>
          <li>We Come To You - Ultimate Convenience!</li>
          <li>Affordable Rates</li>
        </ul>
      </section>
    </div>
  );
} 