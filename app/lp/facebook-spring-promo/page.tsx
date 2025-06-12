"use client"; // Required if using hooks like useSearchParams

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense
import Link from "next/link";
import { CheckCircle, Clock, Gift, Star, ArrowRight, Percent, Calendar, Phone } from "lucide-react";

// This internal component is needed because useSearchParams can only be used in Client Components
function CampaignLeadForm() {
  const searchParams = useSearchParams(); // Hooks can only be called in Client Components

  // --- Ad Specific Custom Fields (using friendly keys for your API endpoint) ---
  // These keys should match what your /api/submit-ad-lead expects in customFieldsFromProps
  const adSpecificCustomFields: Record<string, string> = {
    // This value will be specific to this landing page/campaign
    cf_ad_platform: "Facebook", // e.g., "Facebook", "GoogleAds", "LinkedIn"
    cf_ad_campaign_name: "Facebook Spring Promo", // Specific to this campaign
    
    // You can try to get ad_ids or other specific params if they are in the URL
    // Example: if URL is /lp/example-campaign?ad_id=12345
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    cf_ad_keyword: searchParams?.get("keyword") || "",
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:Facebook", // Matches cf_ad_platform
    "AdCampaign:FacebookSpringPromo", // Matches cf_ad_campaign_name
    "Promo:SpringOffer",
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Point to your new API endpoint
      tags={adSpecificTags}
      customFields={adSpecificCustomFields} // Pass the ad-specific (friendly key) custom fields
      campaignName="Facebook Spring Promo" // This is also passed in the payload
      successRedirectUrl="/thank-you-ads" // Or a more specific thank-you page
      formTitle="Claim Your Exclusive Spring Offer"
      formDescription="Limited time promotion! Fill out the form below to secure your special pricing on professional mobile notary services."
      submitButtonText="Claim My Spring Discount"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function FacebookSpringPromoLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#A52A2A] via-[#8B0000] to-[#660000] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-32 w-12 h-12 border-2 border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium mb-6">
                <Gift className="h-5 w-5 mr-2" />
                🌸 Exclusive Facebook Spring Offer
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Spring Into 
                <span className="text-yellow-300"> Savings!</span>
              </h1>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl mb-8 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <Percent className="h-8 w-8 text-yellow-300 mr-3" />
                  <span className="text-3xl font-bold">25% OFF</span>
                </div>
                <p className="text-center text-lg">
                  Professional Mobile Notary Services
                </p>
                <p className="text-center text-sm text-white/80 mt-2">
                  Limited time offer • Facebook exclusive
                </p>
              </div>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Don't miss out on this exclusive spring promotion! Get professional mobile notary services 
                at an unbeatable price. Perfect for all your document needs - from real estate to estate planning.
              </p>
              
              {/* Urgency Timer */}
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg mb-8 border border-white/30">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-300" />
                  <span className="font-semibold">Limited Time Offer - Ends Soon!</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#form" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-lg font-bold text-center transition-colors inline-flex items-center justify-center shadow-lg">
                  Claim Your 25% Discount
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a href="tel:+1234567890" className="border-2 border-white text-white hover:bg-white hover:text-[#A52A2A] px-8 py-4 rounded-lg font-semibold text-center transition-colors inline-flex items-center justify-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </a>
              </div>
            </div>

            {/* Right Column - Offer Details */}
            <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A52A2A] rounded-full mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#002147] mb-2">Spring Special Includes</h3>
                <p className="text-gray-600">Everything you need at 25% off regular pricing</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span>Professional mobile notary service</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span>Travel to your location included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span>All document types accepted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span>Same-day availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span>NNA certified notaries</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#A52A2A] mb-1">
                  Starting at $56.25
                </div>
                <div className="text-sm text-gray-500 line-through mb-1">
                  Regular price: $75
                </div>
                <div className="text-xs text-gray-600">
                  *25% discount applied
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Join Thousands of Satisfied Houston Customers</h2>
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xl font-semibold text-gray-700">4.9/5</span>
              <span className="text-gray-600">(500+ reviews)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">1K+</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Happy Customers</h3>
              <p className="text-gray-600">Trusted by over 1,000 Houston residents for their notary needs.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-[#A52A2A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">24h</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Fast Response</h3>
              <p className="text-gray-600">Average response time of 24 hours or less for all appointments.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-[#002147] rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">7</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Days a Week</h3>
              <p className="text-gray-600">Available every day of the week to serve your busy schedule.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">All Services Included in Spring Promotion</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take advantage of 25% off any of our professional notary services during this limited-time spring offer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#A52A2A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#002147] mb-2">General Notary</h4>
              <p className="text-sm text-gray-600">POAs, affidavits, contracts, and standard documents</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#A52A2A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#002147] mb-2">Real Estate</h4>
              <p className="text-sm text-gray-600">Deeds, mortgage documents, and property transfers</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#A52A2A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#002147] mb-2">Estate Planning</h4>
              <p className="text-sm text-gray-600">Wills, trusts, and healthcare directives</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#A52A2A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-[#002147] mb-2">Business Docs</h4>
              <p className="text-sm text-gray-600">Corporate agreements, contracts, and business forms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="form" className="py-16 bg-gradient-to-r from-[#002147] to-[#003366] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-[#A52A2A] px-6 py-3 rounded-full text-sm font-medium mb-6">
                <Calendar className="h-5 w-5 mr-2" />
                Limited Time Offer
              </div>
              <h2 className="text-3xl font-bold mb-4">Don't Miss Out - Claim Your 25% Discount Now!</h2>
              <p className="text-xl text-blue-100">
                Fill out the form below and we'll contact you within 2 hours to schedule your discounted notary service.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <Suspense fallback={<div className="text-center p-8 text-gray-600">Loading form...</div>}>
                <CampaignLeadForm />
              </Suspense>
            </div>

            <div className="text-center mt-8">
              <p className="text-blue-200 text-sm">
                ⏰ This exclusive Facebook offer ends soon. Secure your discount today!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#A52A2A] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Still Have Questions About Our Spring Promotion?</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Our friendly team is standing by to answer your questions and help you take advantage of this limited-time offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+1234567890" className="bg-white text-[#A52A2A] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Phone className="mr-2 h-5 w-5" />
              Call Now for Instant Help
            </a>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-[#A52A2A] px-8 py-3 rounded-lg font-semibold transition-colors">
              Send Us a Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 