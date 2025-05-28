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
    cf_ad_platform: "LinkedIn", // e.g., "Facebook", "GoogleAds", "LinkedIn"
    cf_ad_campaign_name: "LinkedIn B2B Notary Solutions Q3", // Specific to this campaign
    
    // You can try to get ad_ids or other specific params if they are in the URL
    // Example: if URL is /lp/example-campaign?ad_id=12345
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    // cf_ad_keyword: searchParams.get("keyword") || "", // If applicable
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:LinkedIn", // Matches cf_ad_platform
    "Audience:B2B",
    "AdCampaign:LinkedInB2BNotarySolutionsQ3", // Matches cf_ad_campaign_name
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Point to your new API endpoint
      tags={adSpecificTags}
      customFields={adSpecificCustomFields} // Pass the ad-specific (friendly key) custom fields
      campaignName="LinkedIn B2B Notary Solutions Q3" // This is also passed in the payload
      successRedirectUrl="/thank-you-ads" // Or a more specific thank-you page
      formTitle="Streamline Your Business Notary Needs"
      formDescription="Discover reliable and efficient mobile notary services for your business. Fill out the form for a consultation."
      submitButtonText="Request a Consultation"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function LinkedInB2BSolutionsLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Professional Notary Solutions for Your Business</h1>
        <p className="text-xl text-gray-600 mt-4">
          Partner with Houston Mobile Notary Pros for all your corporate notary requirements.
        </p>
      </header>

      <section className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        {/* Wrap the form in Suspense because CampaignLeadForm uses useSearchParams */}
        <Suspense fallback={<div className="text-center p-8">Loading form, please wait...</div>}>
          <CampaignLeadForm />
        </Suspense>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Services for Businesses:</h2>
        <ul className="list-disc list-inside inline-block text-left text-gray-600">
          <li>Corporate Document Notarization</li>
          <li>Bulk Employee I-9 Verification</li>
          <li>On-site Services at Your Office</li>
          <li>Confidential and Secure</li>
        </ul>
      </section>
    </div>
  );
} 