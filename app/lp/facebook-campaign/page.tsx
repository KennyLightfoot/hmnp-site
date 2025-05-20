"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import { Gift, ShieldCheck, Zap } from "lucide-react";

const FacebookCampaignPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="py-12 bg-gradient-to-r from-[#002147] to-[#00346e] text-white text-center">
        <div className="container mx-auto px-6">
          <Zap className="mx-auto h-12 w-12 mb-4 text-yellow-400" /> 
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
            Exclusive Facebook Offer Just For You!
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
            Unlock special savings on our fast & reliable mobile notary services. This limited-time offer is only available here!
          </p>
        </div>
      </header>

      <main className="py-12 md:py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">What You'll Get:</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Gift className="h-6 w-6 text-[#002147] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700">
                    <strong>Special Discount:</strong> Save <span className="font-bold text-[#002147]">[Specify Discount, e.g., 20% OFF]</span> on your first mobile notary service booked through this page.
                  </span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-6 w-6 text-[#002147] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700">
                    <strong>Priority Booking:</strong> Get access to our express scheduling to have your documents notarized quickly.
                  </span>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-6 w-6 text-[#002147] mr-3 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700">
                    <strong>Trusted Professionals:</strong> Our certified and experienced notaries come to you, ensuring a secure and convenient experience.
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500">
              [Placeholder for a compelling image/graphic - e.g., offer badge, happy client, service in action]
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Why Choose Us?</h3>
              <p className="text-gray-700 text-lg mb-2">
                Houston Mobile Notary Pros is dedicated to providing convenient, professional, and secure notary services across the Houston area. 
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Fast and reliable service at your location.</li>
                <li>Experienced and background-checked notaries.</li>
                <li>Transparent pricing with no hidden fees.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-2xl lg:p-10">
            <LeadForm
              ghlFormUrl="https://api.leadconnectorhq.com/widget/form/CD4rjc3peCLUo3dqMLFk"
              tags={["facebook_promo_q3", "social_lead", "offer_claimed"]}
              customFields={{
                "campaign_name": "Facebook Q3 Promo", 
                "lead_source": "Facebook Ad - Exclusive Offer"
              }}
              submitButtonText="Claim My Discount Now!"
              formTitle="Secure Your Exclusive Discount"
              formDescription="Fill in your details below. This offer won't last long!"
              successRedirectUrl="/thank-you-fb"
              privacyPolicyLink="/privacy"
              termsOfServiceLink="/terms"
            />
          </div>
        </div>
      </main>

      <section className="py-12 bg-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Don't Miss Out!</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            This exclusive Facebook offer is only available for a limited time. Join [Number] of satisfied clients who've benefited from our professional notary services.
          </p>
        </div>
      </section>
    </div>
  );
};

export default FacebookCampaignPage; 