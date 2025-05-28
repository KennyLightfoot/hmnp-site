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
    cf_ad_platform: "Yelp", // e.g., "Facebook", "GoogleAds", "LinkedIn"
    cf_ad_campaign_name: "Yelp General Notary Q3", // Specific to this campaign
    
    // You can try to get ad_ids or other specific params if they are in the URL
    // Example: if URL is /lp/example-campaign?ad_id=12345
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    // cf_ad_keyword: searchParams.get("keyword") || "", // If applicable
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:Yelp", // Matches cf_ad_platform
    "AdCampaign:YelpGeneralNotaryQ3", // Matches cf_ad_campaign_name
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Point to your new API endpoint
      tags={adSpecificTags}
      customFields={adSpecificCustomFields} // Pass the ad-specific (friendly key) custom fields
      campaignName="Yelp General Notary Q3" // This is also passed in the payload
      successRedirectUrl="/thank-you-ads" // Or a more specific thank-you page
      formTitle="Top-Rated Notary on Yelp!"
      formDescription="Fill out your details below to book Houston's best mobile notary, highly rated on Yelp!"
      submitButtonText="Book Your Notary Now"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function YelpGeneralNotaryLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Houston's Trusted Mobile Notary - As Seen on Yelp!</h1>
        <p className="text-xl text-gray-600 mt-4">
          Convenient, professional, and highly-rated notary services.
        </p>
      </header>

      <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        {/* Wrap the form in Suspense because CampaignLeadForm uses useSearchParams */}
        <Suspense fallback={<div className="text-center p-8">Loading form, please wait...</div>}>
          <CampaignLeadForm />
        </Suspense>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Why Our Yelp Reviewers Love Us:</h2>
        <ul className="list-disc list-inside inline-block text-left text-gray-600">
          <li>Exceptional Customer Service</li>
          <li>Prompt and Punctual</li>
          <li>Knowledgeable and Efficient</li>
          <li>5-Star Rated Experiences</li>
        </ul>
      </section>
    </div>
  );
} 