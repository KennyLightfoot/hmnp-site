"use client";

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Star, Shield, Clock, MapPin, Users, Award, CheckCircle, Phone, Zap, FileText, Home, Building2 } from "lucide-react";

function CampaignLeadForm() {
  const searchParams = useSearchParams();

  const adSpecificCustomFields: Record<string, string> = {
    cf_ad_platform: "General", 
    cf_ad_campaign_name: "Houston Mobile Notary Pros - Professional Services", 
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
  };

  const adSpecificTags = [
    "AdLead:General",
    "AdCampaign:HoustonMobileNotaryPros",
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead"
      tags={adSpecificTags}
      customFields={adSpecificCustomFields}
      campaignName="Houston Mobile Notary Pros - Professional Services"
      successRedirectUrl="/thank-you-ads"
      formTitle="Get Your Professional Notary Service"
      formDescription="Fill out your details below to book Houston's most trusted mobile notary service."
      submitButtonText="Book My Appointment"
    />
  );
}

export default function HoustonMobileNotaryLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <header className="py-16 bg-gradient-to-r from-[#002147] to-[#00346e] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-[#A52A2A] p-3 rounded-full mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xl font-semibold ml-2">4.9/5 Stars</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Houston's Premier<br />
              <span className="text-yellow-400">Mobile Notary Service</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Professional, convenient, and trusted notary services at your location. 
              We come to you - home, office, hospital, or anywhere in the Greater Houston area.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">1,000+</div>
                <div className="text-slate-300">Happy Clients</div>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-slate-300">Average Rating</div>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">Same Day</div>
                <div className="text-slate-300">Service Available</div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">Certified</div>
                <div className="text-slate-300">& Insured</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Content */}
            <div className="space-y-10">
              {/* Services Overview */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <FileText className="h-8 w-8 text-[#A52A2A] mr-3" />
                  Complete Notary Services
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <Home className="h-8 w-8 text-[#A52A2A] mb-4" />
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Real Estate Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>✓ Loan Signings & Closings</li>
                      <li>✓ Refinance Documents</li>
                      <li>✓ Purchase Agreements</li>
                      <li>✓ Deeds & Mortgages</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <Shield className="h-8 w-8 text-[#A52A2A] mb-4" />
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Legal Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>✓ Wills & Trusts</li>
                      <li>✓ Power of Attorney</li>
                      <li>✓ Affidavits & Sworn Statements</li>
                      <li>✓ Court Documents</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <Building2 className="h-8 w-8 text-[#A52A2A] mb-4" />
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Business Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>✓ Contracts & Agreements</li>
                      <li>✓ Corporate Resolutions</li>
                      <li>✓ Employment Paperwork</li>
                      <li>✓ Partnership Documents</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <FileText className="h-8 w-8 text-[#A52A2A] mb-4" />
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Personal Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>✓ Medical & Healthcare Forms</li>
                      <li>✓ School & College Applications</li>
                      <li>✓ Travel Documents</li>
                      <li>✓ Insurance Claims</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Why Choose Us */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Award className="h-8 w-8 text-[#A52A2A] mr-3" />
                  Why Houston Chooses Us
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-1">Mobile Convenience</h3>
                        <p className="text-gray-700">We come to your location - home, office, hospital, or anywhere in the Greater Houston area. No travel required on your part.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-1">Flexible Scheduling</h3>
                        <p className="text-gray-700">Same-day appointments available. Evening and weekend service to accommodate your busy schedule. We work around your timeline.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <Shield className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-1">Certified & Insured</h3>
                        <p className="text-gray-700">NNA certified notaries, background screened, bonded, and fully insured. Your documents and privacy are completely protected.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <div className="flex items-start">
                      <Zap className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-1">Transparent Pricing</h3>
                        <p className="text-gray-700">Upfront pricing starting at $75 with no hidden fees. You know exactly what you'll pay before we arrive at your location.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Client Testimonials */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Star className="h-8 w-8 text-[#A52A2A] mr-3" />
                  What Our Clients Say
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Jennifer M., Katy</span>
                    </div>
                    <p className="text-gray-700 italic">"Outstanding service! They came to my home office within 2 hours for a real estate closing. Professional, efficient, and saved me a trip downtown. Highly recommend!"</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Robert K., The Woodlands</span>
                    </div>
                    <p className="text-gray-700 italic">"Needed estate planning documents notarized urgently. They accommodated same-day service and were incredibly professional. Best notary service in Houston!"</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Lisa W., Sugar Land</span>
                    </div>
                    <p className="text-gray-700 italic">"Perfect for busy professionals! They handled all my business documents at my office. Punctual, knowledgeable, and made everything stress-free."</p>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <section className="bg-[#A52A2A] text-white p-8 rounded-xl">
                <div className="text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Need Immediate Service?</h3>
                  <p className="text-lg mb-6">Call us directly for same-day appointments and urgent notarizations throughout the Houston area.</p>
                  <a href={`tel:${require('@/lib/phone').getBusinessTel()}`} className="bg-white text-[#A52A2A] px-8 py-4 rounded-lg font-bold hover:bg-slate-100 transition-colors inline-block text-lg">
                    Call Now: (832) 617-4285
                  </a>
                </div>
              </section>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                <div className="text-center mb-6">
                  <div className="bg-[#002147] text-white px-4 py-2 rounded-full inline-block mb-4 font-bold">
                    📋 PROFESSIONAL NOTARY SERVICE
                  </div>
                  <div className="text-2xl font-bold text-[#002147] mb-2">Starting at $75</div>
                  <div className="text-gray-600">Mobile service • Same-day available • No hidden fees</div>
                </div>

                <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
                  <CampaignLeadForm />
                </Suspense>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-4 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>SSL Secured</span>
                  <Award className="h-4 w-4 text-[#A52A2A]" />
                  <span>NNA Certified</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.9/5 Rated</span>
                </div>
                <p>Your information is safe and secure</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Service Areas */}
      <section className="py-16 bg-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#002147] mb-8">Serving the Greater Houston Area</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              "Houston", "Katy", "Sugar Land", "The Woodlands", "Pearland", "Humble",
              "Cypress", "Spring", "Tomball", "Kingwood", "Friendswood", "Missouri City"
            ].map((city) => (
              <div key={city} className="bg-white p-3 rounded-lg shadow-sm text-center">
                <span className="text-[#002147] font-medium">{city}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            And many more locations throughout Harris County, Fort Bend County, and Montgomery County. 
            <span className="font-semibold text-[#002147]"> Call to confirm service in your area!</span>
          </p>
        </div>
      </section>
    </div>
  );
}