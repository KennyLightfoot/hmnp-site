"use client"; // Required if using hooks like useSearchParams

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense
import Link from "next/link";
import { CheckCircle, Clock, Shield, Users, Award, ArrowRight, FileText, MapPin } from "lucide-react";
import { SERVICES_CONFIG } from "@/lib/services/config";

// This internal component is needed because useSearchParams can only be used in Client Components
function CampaignLeadForm() {
  const searchParams = useSearchParams(); // Hooks can only be called in Client Components

  // --- Ad Specific Custom Fields (using friendly keys for your API endpoint) ---
  // These keys should match what your /api/submit-ad-lead expects in customFieldsFromProps
  const adSpecificCustomFields: Record<string, string> = {
    // This value will be specific to this landing page/campaign
    cf_ad_platform: "GoogleAds", // e.g., "Facebook", "GoogleAds", "LinkedIn"
    cf_ad_campaign_name: "Google Loan Signings Q3", // Specific to this campaign
    
    // You can try to get ad_ids or other specific params if they are in the URL
    // Example: if URL is /lp/example-campaign?ad_id=12345
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
    cf_ad_keyword: searchParams?.get("keyword") || "",
  };

  // --- Ad Specific Tags ---
  const adSpecificTags = [
    "AdLead:GoogleAds", // Matches cf_ad_platform
    "ServiceInterest:LoanSigning",
    "AdCampaign:GoogleLoanSigningsQ3", // Matches cf_ad_campaign_name
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead" // Point to your new API endpoint
      tags={adSpecificTags}
      customFields={adSpecificCustomFields} // Pass the ad-specific (friendly key) custom fields
      campaignName="Google Loan Signings Q3" // This is also passed in the payload
      successRedirectUrl="/thank-you-ads" // Or a more specific thank-you page
      formTitle="Get Your Loan Documents Signed Today"
      formDescription="Connect with our certified loan signing specialists. Fast, reliable, and professional service."
      submitButtonText="Book Your Loan Signing"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function GoogleLoanSigningLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div>
              <div className="inline-block bg-[#A52A2A] px-4 py-2 rounded-full text-sm font-medium mb-6">
                ⭐ Houston's #1 Rated Loan Signing Service
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Expert Loan Signing Services
                <span className="text-[#A52A2A]"> Ready When You Are</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Need loan documents signed quickly and correctly? Our certified signing specialists handle 
                refinances, purchases, and HELOCs with precision and care. Available 7 days a week.
              </p>
              
              {/* Key Benefits */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">NNA Certified Specialists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">Same-Day Availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">Mobile Service Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">RON Capable</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors inline-flex items-center justify-center">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <Link href="/services/loan-signing-specialist" className="border-2 border-white text-white hover:bg-white hover:text-[#002147] px-8 py-4 rounded-lg font-semibold text-center transition-colors">
                  Learn More About Our Service
                </Link>
              </div>
            </div>

            {/* Right Column - Stats/Social Proof */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Trusted by Houston</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">500+</div>
                  <div className="text-sm text-blue-100">Loan Signings Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">24hr</div>
                  <div className="text-sm text-blue-100">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">4.9★</div>
                  <div className="text-sm text-blue-100">Customer Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">7days</div>
                  <div className="text-sm text-blue-100">Week Availability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Comprehensive Loan Signing Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From refinances to purchases, we handle all types of loan documents with precision and professionalism.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="bg-[#002147] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Refinance Signings</h3>
              <p className="text-gray-600 mb-4">Complete refinance document packages handled with expertise and care.</p>
              <ul className="text-sm text-gray-500 text-left space-y-1">
                <li>• Rate and term refinances</li>
                <li>• Cash-out refinances</li>
                <li>• HELOC documents</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="bg-[#A52A2A] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Purchase Signings</h3>
              <p className="text-gray-600 mb-4">Make your home buying experience smooth with our certified specialists.</p>
              <ul className="text-sm text-gray-500 text-left space-y-1">
                <li>• Conventional purchases</li>
                <li>• FHA/VA loans</li>
                <li>• Investment properties</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="bg-[#002147] p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Specialty Loans</h3>
              <p className="text-gray-600 mb-4">Experienced with complex and specialty loan document types.</p>
              <ul className="text-sm text-gray-500 text-left space-y-1">
                <li>• Reverse mortgages</li>
                <li>• Commercial loans</li>
                <li>• Construction loans</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#002147] mb-6">
                Why Lenders & Title Companies Choose Us
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We understand the importance of accuracy and timeliness in loan signings. That's why we've built our reputation on reliability.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-2 rounded-full flex-shrink-0">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2">NNA Certified & Background Screened</h4>
                    <p className="text-gray-600">All our loan signing agents are certified by the National Notary Association and undergo comprehensive background checks.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-2 rounded-full flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2">Fast Turnaround Times</h4>
                    <p className="text-gray-600">Same-day appointments available with documents returned promptly via FedEx or scan-back.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-2 rounded-full flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2">Statewide Coverage</h4>
                    <p className="text-gray-600">Serving the greater Houston area with mobile notary services at your client's convenience.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#002147] to-[#003366] p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <p className="text-blue-100 mb-6">
                Join the hundreds of satisfied clients who trust us with their most important loan signings.
              </p>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">${SERVICES_CONFIG.LOAN_SIGNING.basePrice}</div>
                  <div className="text-sm text-blue-100">Starting price for loan signings</div>
                  <div className="text-xs text-blue-200 mt-2">*Includes travel within {SERVICES_CONFIG.LOAN_SIGNING.includedRadius} miles</div>
                </div>
              </div>
              <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold w-full text-center block transition-colors">
                Book Your Signing Today
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="form" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Connect With Our Loan Signing Specialists</h2>
              <p className="text-xl text-gray-600">
                Fill out the form below and we'll contact you within 2 hours to schedule your signing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
                <CampaignLeadForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[#002147] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Questions About Our Loan Signing Services?</h3>
          <p className="text-blue-100 mb-6">
            Our team is here to help. Contact us directly for immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Contact Us
            </Link>
            <Link href="/services/loan-signing-specialist" className="border-2 border-white text-white hover:bg-white hover:text-[#002147] px-8 py-3 rounded-lg font-semibold transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 