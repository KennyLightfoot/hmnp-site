"use client";

import LeadForm from "@/components/lead-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Star, Award, Clock, MapPin, Shield, Users, CheckCircle, Phone } from "lucide-react";
import { SERVICES_CONFIG } from "@/lib/services/config";

function YelpLeadForm() {
  const searchParams = useSearchParams();

  const adSpecificCustomFields: Record<string, string> = {
    cf_ad_platform: "Yelp",
    cf_ad_campaign_name: "Yelp General Notary Q3",
    cf_ad_id: searchParams?.get("ad_id") || "", 
    cf_ad_group_id: searchParams?.get("adgroup_id") || "",
  };

  const adSpecificTags = [
    "AdLead:Yelp",
    "AdCampaign:YelpGeneralNotaryQ3",
    "Status:New_Ad_Lead"
  ];

  return (
    <LeadForm
      apiEndpoint="/api/submit-ad-lead"
      tags={adSpecificTags}
      customFields={adSpecificCustomFields}
      campaignName="Yelp General Notary Q3"
      successRedirectUrl="/thank-you-ads"
      formTitle="Book Houston's Top-Rated Notary"
      formDescription="Join hundreds of satisfied Yelp reviewers - get professional mobile notary service at your location."
      submitButtonText="Book My Appointment Now"
    />
  );
}

export default function YelpGeneralNotaryLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section */}
      <header className="relative py-16 bg-gradient-to-r from-[#002147] to-[#00346e] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-[#A52A2A] p-3 rounded-full mr-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xl font-semibold ml-2">4.9/5 on Yelp</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Houston's Most Trusted<br />
              <span className="text-yellow-400">Mobile Notary Service</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discovered us on Yelp? You've found Houston's highest-rated mobile notary service. 
              Professional, convenient, and trusted by 500+ happy clients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">500+</div>
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
              {/* What Our Yelp Reviewers Say */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Star className="h-8 w-8 text-[#A52A2A] mr-3" />
                  What Our Yelp Reviewers Love
                </h2>
                
                <div className="grid gap-4 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Sarah M.</span>
                    </div>
                    <p className="text-gray-700 italic">"Exceptional service! They came to my office within 2 hours and were so professional. Made the whole process stress-free."</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Mike R.</span>
                    </div>
                    <p className="text-gray-700 italic">"Best notary service in Houston! Punctual, knowledgeable, and saved me a trip to the bank. Highly recommend!"</p>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <CheckCircle className="h-8 w-8 text-[#A52A2A] mr-3" />
                  Complete Notary Services
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Real Estate Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Loan Signings</li>
                      <li>• Purchase Agreements</li>
                      <li>• Refinance Documents</li>
                      <li>• Deeds & Mortgages</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Legal Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Wills & Trusts</li>
                      <li>• Power of Attorney</li>
                      <li>• Affidavits</li>
                      <li>• Court Documents</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Business Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Contracts & Agreements</li>
                      <li>• Corporate Resolutions</li>
                      <li>• Employment Papers</li>
                      <li>• Partnership Docs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-3 text-[#002147]">Personal Documents</h3>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Medical Forms</li>
                      <li>• School Applications</li>
                      <li>• Travel Documents</li>
                      <li>• Insurance Claims</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Why Choose Us */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Shield className="h-8 w-8 text-[#A52A2A] mr-3" />
                  Why Yelp Reviewers Choose Us
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">We Come to You</h3>
                      <p className="text-gray-700">Service at your home, office, hospital, or any convenient location throughout the Greater Houston area.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Fast & Flexible</h3>
                      <p className="text-gray-700">Same-day appointments available. Evening and weekend service to fit your schedule.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Certified & Insured</h3>
                      <p className="text-gray-700">NNA certified, background screened, and fully insured for your peace of mind.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Award className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Transparent Pricing</h3>
                      <p className="text-gray-700">Upfront pricing starting at ${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}. No hidden fees or surprise charges.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Emergency Contact */}
              <section className="bg-[#A52A2A] text-white p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 mr-3" />
                  <h3 className="text-xl font-bold">Need Immediate Service?</h3>
                </div>
                <p className="mb-4">Call us directly for same-day appointments and urgent notarizations.</p>
                <a href="tel:+18326174285" className="bg-white text-[#A52A2A] px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors inline-block">
                  Call Now: (832) 617-4285
                </a>
              </section>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
                  <YelpLeadForm />
                </Suspense>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-4 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>SSL Secured</span>
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>NNA Certified</span>
                </div>
                <p>Your information is safe and secure</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}