"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import { MapPin, Phone, Mail, Building, Star, Users, Clock, Shield, Award, CheckCircle } from "lucide-react";
import Link from "next/link";

const GMBContactPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper to-white">
      {/* Header Section */}
      <header className="py-16 bg-gradient-to-r from-secondary to-secondary text-white text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-primary p-3 rounded-full mr-4">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xl font-semibold ml-2">4.9/5 on Google</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Found Us on <span className="text-yellow-400">Google</span>?<br />
              You're in the Right Place!
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Houston's most trusted mobile notary service. We're here to help with all your notarization needs, 
              right at your doorstep.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-brand mb-2" />
                <div className="text-2xl font-bold">1,000+</div>
                <div className="text-slate-300">Google Reviews</div>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-brand mb-2" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-slate-300">Response Time</div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-brand mb-2" />
                <div className="text-2xl font-bold">Verified</div>
                <div className="text-slate-300">Google Business</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-16">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Lead Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
              <LeadForm
                apiEndpoint="/api/submit-ad-lead"
                tags={["gmb_lead", "AdLead:GBP", "ServiceInterest:MobileNotary"]}
                customFields={{
                  cf_ad_platform: "GoogleBusinessProfile",
                  cf_ad_campaign_name: "GBP Direct Inbound",
                  cf_ad_id: "google-business-profile",
                  estimated_value: "85",
                }}
                submitButtonText="Get Your Quote Now"
                formTitle="Quick Contact Form"
                formDescription="Fill out your details and we'll get back to you within 1 hour during business hours."
                successRedirectUrl="/contact/thank-you-gmb"
                privacyPolicyLink="/privacy-policy"
                termsOfServiceLink="/terms-of-service"
                trackingOverrides={{
                  lead_source: "google_business_profile",
                  service_type: "mobile-notary",
                  estimated_value: 85,
                  campaign_name: "GBP Direct Inbound",
                  ad_platform: "google_business_profile",
                }}
              />
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <div className="flex justify-center items-center space-x-4 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>SSL Secured</span>
                <Shield className="h-4 w-4 text-green-600" />
                <span>Google Verified</span>
              </div>
              <p>Your information is safe and secure</p>
            </div>
          </div>

          {/* Right Column: Contact Info & Services */}
          <div className="space-y-10 order-1 lg:order-2">
            {/* Direct Contact Information */}
            <section>
              <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center">
                <Phone className="h-8 w-8 text-primary mr-3" />
                Direct Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-primary">
                  <div className="flex items-start">
                    <Phone className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-1">Call Us</h3>
                      <a href={`tel:${require('@/lib/phone').getBusinessTel()}`} className="text-lg text-primary hover:underline font-semibold">
                        (832) 617-4285
                      </a>
                      <p className="text-sm text-gray-600 mt-1">Available 7 days a week, 8 AM - 8 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-primary">
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-1">Email Us</h3>
                      <a href="mailto:contact@houstonmobilenotarypros.com" className="text-lg text-primary hover:underline font-semibold">
                        contact@houstonmobilenotarypros.com
                      </a>
                      <p className="text-sm text-gray-600 mt-1">We respond within 1 hour during business hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-primary">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-1">Service Area</h3>
                      <p className="text-lg text-gray-700 mb-2">Greater Houston Area & Surrounding Counties</p>
                      <p className="text-sm text-gray-600">We come to you - home, office, hospital, or any location!</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Choose Us */}
            <section>
              <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center">
                <Award className="h-8 w-8 text-primary mr-3" />
                Why Google Users Choose Us
              </h2>
              
              <div className="grid gap-4">
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Google Verified Business</h3>
                      <p className="text-gray-700">Verified on Google My Business with 4.9/5 stars from 1,000+ reviews</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Fast Response</h3>
                      <p className="text-gray-700">Same-day service available with 1-hour response time during business hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <Shield className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Certified & Insured</h3>
                      <p className="text-gray-700">NNA certified, background screened, and fully insured for your protection</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-[#002147] mb-1">Mobile Convenience</h3>
                      <p className="text-gray-700">We come to your location - no need to travel or wait in lines</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Preview */}
            <section>
              <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center">
                <CheckCircle className="h-8 w-8 text-primary mr-3" />
                Our Services
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-secondary mb-2">Real Estate</h3>
                  <p className="text-sm text-gray-600">Loan signings, deeds, mortgages</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-secondary mb-2">Legal Documents</h3>
                  <p className="text-sm text-gray-600">Wills, trusts, power of attorney</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-secondary mb-2">Business</h3>
                  <p className="text-sm text-gray-600">Contracts, agreements, corporate docs</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-bold text-secondary mb-2">Personal</h3>
                  <p className="text-sm text-gray-600">Medical forms, applications, affidavits</p>
                </div>
              </div>
            </section>
            
            {/* Google Reviews Highlight */}
            <section className="bg-gradient-to-r from-secondary to-secondary text-white p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 mr-3 fill-yellow-400 text-yellow-400" />
                <h3 className="text-xl font-bold">What Our Google Reviewers Say</h3>
              </div>
              <div className="space-y-3">
                <div className="italic">
                  <p className="mb-1">"Outstanding service! Found them on Google and they exceeded all expectations."</p>
                  <p className="text-sm text-slate-300">- Jennifer K. ⭐⭐⭐⭐⭐</p>
                </div>
                <div className="italic">
                  <p className="mb-1">"Professional, punctual, and convenient. Highly recommend!"</p>
                  <p className="text-sm text-slate-300">- Robert M. ⭐⭐⭐⭐⭐</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GMBContactPage; 