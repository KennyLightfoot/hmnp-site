"use client"; // Required if using hooks like useSearchParams

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense
import Link from "next/link";
import { CheckCircle, Building, Users, Clock, Shield, Award, ArrowRight, FileText, Briefcase, Star } from "lucide-react";

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
    cf_ad_keyword: searchParams?.get("keyword") || "",
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
      formTitle="Scale Your Business Notary Operations"
      formDescription="Get a customized quote for your business notary needs. Our team will contact you within 24 hours to discuss volume pricing and service options."
      submitButtonText="Request Enterprise Consultation"
      // termsOfServiceLink="/terms-example-campaign" // Optional: campaign-specific links
      // privacyPolicyLink="/privacy-example-campaign"
    />
  );
}

export default function LinkedInB2BSolutionsLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#002147] via-[#003366] to-[#004080] text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div>
              <div className="inline-flex items-center bg-[#A52A2A] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Building className="h-4 w-4 mr-2" />
                Enterprise Notary Solutions
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Professional Notary Solutions 
                <span className="text-[#A52A2A]"> Built for Business</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Streamline your organization's notary needs with our comprehensive business solutions. 
                From employee I-9s to corporate contracts, we provide scalable, reliable notary services 
                that keep your business moving forward.
              </p>
              
              {/* Key Benefits */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">Volume Pricing Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">Dedicated Account Manager</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">On-site Service Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] flex-shrink-0" />
                  <span className="text-sm">Custom Service Agreements</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-4 rounded-lg font-semibold text-center transition-colors inline-flex items-center justify-center">
                  Get Enterprise Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <Link href="/services/business" className="border-2 border-white text-white hover:bg-white hover:text-[#002147] px-8 py-4 rounded-lg font-semibold text-center transition-colors">
                  View Business Solutions
                </Link>
              </div>
            </div>

            {/* Right Column - Trust Indicators */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Trusted by Houston Businesses</h3>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">200+</div>
                  <div className="text-sm text-blue-100">Corporate Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">5000+</div>
                  <div className="text-sm text-blue-100">Business Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">99.8%</div>
                  <div className="text-sm text-blue-100">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">24hr</div>
                  <div className="text-sm text-blue-100">Response Time</div>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-6">
                <p className="text-sm text-blue-200 text-center mb-4">Certified & Insured for Enterprise</p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-white/10 p-2 rounded">
                    <Shield className="h-6 w-6 text-[#A52A2A]" />
                  </div>
                  <div className="bg-white/10 p-2 rounded">
                    <Award className="h-6 w-6 text-[#A52A2A]" />
                  </div>
                  <div className="bg-white/10 p-2 rounded">
                    <Star className="h-6 w-6 text-[#A52A2A]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Comprehensive Business Notary Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From HR documentation to corporate agreements, we handle all your business notarization needs with enterprise-grade service and security.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#002147] p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-4 text-center">HR & Employee Services</h3>
              <p className="text-gray-600 mb-6 text-center">Streamline your human resources processes with our dedicated HR notary services.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  I-9 Employment Verification
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Employee Background Checks
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Non-Disclosure Agreements
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Employment Contracts
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[#A52A2A]">
              <div className="bg-[#A52A2A] p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <div className="text-center mb-4">
                <span className="bg-[#A52A2A] text-white px-3 py-1 rounded-full text-xs font-semibold">MOST POPULAR</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-4 text-center">Corporate Documentation</h3>
              <p className="text-gray-600 mb-6 text-center">Professional handling of all your corporate legal documentation needs.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Corporate Resolutions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Board Meeting Minutes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Partnership Agreements
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Commercial Contracts
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#002147] p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#002147] mb-4 text-center">Specialized Services</h3>
              <p className="text-gray-600 mb-6 text-center">Advanced notary services for complex business requirements and compliance needs.</p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Apostille Services
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  International Documents
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Compliance Documentation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-[#A52A2A] mr-3 flex-shrink-0" />
                  Volume Processing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#002147] mb-6">
                Why Enterprise Clients Choose Houston Mobile Notary Pros
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We understand that business operations can't wait. Our enterprise solutions are designed to integrate seamlessly with your workflow while maintaining the highest standards of security and compliance.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-3 rounded-full flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2 text-lg">Scalable Service Delivery</h4>
                    <p className="text-gray-600">From single documents to large-scale employee onboarding, we scale our services to match your business needs with consistent quality and reliability.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-3 rounded-full flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2 text-lg">Enterprise Security & Compliance</h4>
                    <p className="text-gray-600">Our notaries are background-screened, bonded, and trained in enterprise security protocols. We maintain strict confidentiality and compliance standards.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-[#A52A2A] p-3 rounded-full flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002147] mb-2 text-lg">Dedicated Account Management</h4>
                    <p className="text-gray-600">Each enterprise client receives a dedicated account manager who understands your specific needs and ensures consistent service delivery.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#002147] to-[#003366] p-10 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Enterprise Package Benefits</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-3 flex-shrink-0" />
                  <span>Volume pricing discounts (up to 30% off)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-3 flex-shrink-0" />
                  <span>Priority scheduling and same-day service</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-3 flex-shrink-0" />
                  <span>On-site service at your office location</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-3 flex-shrink-0" />
                  <span>Custom invoicing and reporting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-3 flex-shrink-0" />
                  <span>Dedicated support line</span>
                </li>
              </ul>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-sm text-blue-200 mb-2">Enterprise pricing starts at</div>
                  <div className="text-3xl font-bold text-[#A52A2A] mb-2">$125/month</div>
                  <div className="text-xs text-blue-200">*Includes up to 10 monthly RON seals</div>
                </div>
              </div>
              
              <a href="#form" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-4 rounded-lg font-semibold w-full text-center block transition-colors">
                Request Custom Quote
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Ready to Streamline Your Business Notary Needs?</h2>
              <p className="text-xl text-gray-600">
                Let's discuss how our enterprise solutions can support your business. We'll provide a custom quote within 24 hours.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-xl">
              <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
                <CampaignLeadForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-[#002147] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Partner with Houston's Leading Business Notary Service</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of Houston businesses who trust us with their notarization needs. 
            Contact our enterprise team for immediate assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              Contact Enterprise Team
            </Link>
            <Link href="/services/business" className="border-2 border-white text-white hover:bg-white hover:text-[#002147] px-8 py-4 rounded-lg font-semibold transition-colors">
              View All Business Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 