"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import { Gift, ShieldCheck, Zap, Star, Users, Clock, CheckCircle, Phone, Award, Timer } from "lucide-react";
import { SERVICES_CONFIG } from "@/lib/services/config";

const FacebookCampaignPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <header className="py-16 bg-gradient-to-r from-[#002147] to-[#00346e] text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center mb-6">
              <div className="bg-[#A52A2A] p-3 rounded-full mr-4 animate-pulse">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                LIMITED TIME OFFER
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Exclusive <span className="text-yellow-400">Facebook</span> Offer!<br />
              <span className="text-3xl md:text-4xl">Save 30% Today Only</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Houston's most trusted mobile notary service is offering Facebook followers an exclusive 30% discount. 
              Professional notary services at your location. 30-mile travel included; fair travel tiers up to 50 miles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                  SAVE 30%
                </div>
                <div className="text-2xl font-bold">${(SERVICES_CONFIG.STANDARD_NOTARY.basePrice * 0.7).toFixed(2)}</div>
                <div className="text-slate-300 line-through">Regular ${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}</div>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-slate-300">Facebook Reviews</div>
              </div>
              <div className="flex flex-col items-center">
                <Timer className="h-8 w-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold">24 Hours</div>
                <div className="text-slate-300">Offer Expires</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full opacity-10 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#A52A2A] rounded-full opacity-10 translate-y-12 -translate-x-12"></div>
      </header>

      <main className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Content */}
            <div className="space-y-10">
              {/* Special Offer Details */}
              <section className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-200">
                <div className="flex items-center mb-6">
                  <Gift className="h-8 w-8 text-green-600 mr-4" />
                  <h2 className="text-3xl font-bold text-green-800">Facebook Exclusive Deal</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl shadow-md">
                    <div className="text-3xl font-bold text-green-600 mb-2">30% OFF</div>
                    <div className="text-gray-600 mb-4">All Notary Services</div>
                    <div className="text-2xl font-bold text-[#002147]">Starting at ${(SERVICES_CONFIG.STANDARD_NOTARY.basePrice * 0.7).toFixed(2)}</div>
                    <div className="text-sm text-gray-500 line-through">Regular Price: ${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700">Valid for Facebook users only</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700">Mobile service to your location</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700">Same-day appointments available</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700">No hidden fees or charges</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-100 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-center text-red-700 font-bold">
                    <Timer className="h-5 w-5 mr-2" />
                    Offer expires in 24 hours - Book now to secure your discount!
                  </div>
                </div>
              </section>

              {/* What You Get */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Zap className="h-8 w-8 text-[#A52A2A] mr-3" />
                  What's Included in Your Service
                </h2>
                
                <div className="grid gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-start">
                      <ShieldCheck className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-2">Professional Mobile Service</h3>
                        <p className="text-gray-700">We come to your home, office, hospital, or any convenient location. No need to travel or wait in lines.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-2">Fast & Flexible Scheduling</h3>
                        <p className="text-gray-700">Same-day appointments available. Evening and weekend service to accommodate your busy schedule.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-start">
                      <Award className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-2">Certified & Insured</h3>
                        <p className="text-gray-700">NNA certified notaries, background screened, and fully insured for your complete peace of mind.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#A52A2A]">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-4 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg text-[#002147] mb-2">All Document Types</h3>
                        <p className="text-gray-700">Real estate, legal documents, business contracts, medical forms, and more. We handle it all professionally.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Social Proof */}
              <section>
                <h2 className="text-3xl font-bold text-[#002147] mb-6 flex items-center">
                  <Star className="h-8 w-8 text-[#A52A2A] mr-3" />
                  What Facebook Users Are Saying
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">Maria S.</span>
                      <span className="ml-2 text-sm text-blue-600">via Facebook</span>
                    </div>
                    <p className="text-gray-700 italic">"Found this deal on Facebook and couldn't be happier! Professional service right at my home office. Saved time and money!"</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 font-semibold text-gray-700">David R.</span>
                      <span className="ml-2 text-sm text-blue-600">via Facebook</span>
                    </div>
                    <p className="text-gray-700 italic">"Amazing Facebook discount! The notary was prompt, professional, and made the whole process seamless. Highly recommend!"</p>
                  </div>
                </div>
              </section>

              {/* Urgency Call-to-Action */}
              <section className="bg-[#A52A2A] text-white p-8 rounded-xl">
                <div className="text-center">
                  <Timer className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Don't Miss This Facebook Exclusive!</h3>
                  <p className="text-lg mb-6">This 30% discount is only available for 24 hours and exclusively for Facebook users. Book now to secure your savings!</p>
                  <div className="flex items-center justify-center space-x-4">
                    <Phone className="h-5 w-5" />
                    <span className="text-lg font-semibold">Need immediate help? Call: (832) 617-4285</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-green-200">
                <div className="text-center mb-6">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-block mb-4 font-bold">
                    🎉 FACEBOOK EXCLUSIVE - 30% OFF
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">Save ${(SERVICES_CONFIG.STANDARD_NOTARY.basePrice * 0.3).toFixed(2)}</div>
                  <div className="text-gray-600">Regular ${SERVICES_CONFIG.STANDARD_NOTARY.basePrice} → <span className="font-bold text-green-600">Now {(SERVICES_CONFIG.STANDARD_NOTARY.basePrice * 0.7).toFixed(2)}</span></div>
                  <div className="text-xs text-gray-500 mt-1">Standard Mobile Notary • ≤ 4 docs • ≤ 2 signers • ≤ 15 mi travel</div>
                </div>

                <LeadForm
                  apiEndpoint="/api/submit-ad-lead"
                  tags={["facebook_promo_exclusive", "social_lead", "30_percent_discount"]}
                  customFields={{
                    "campaign_name": "Facebook 30% Discount", 
                    "lead_source": "Facebook Ad - 30% Exclusive Offer",
                    "discount_claimed": "30_percent_facebook_exclusive"
                  }}
                  submitButtonText="Claim My 30% Discount!"
                  formTitle="Secure Your Facebook Discount"
                  formDescription="Fill in your details below to claim your exclusive 30% savings. Limited time offer!"
                  successRedirectUrl="/thank-you-fb-exclusive"
                  privacyPolicyLink="/privacy"
                  termsOfServiceLink="/terms"
                />
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <div className="flex justify-center items-center space-x-4 mb-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>SSL Secured</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.9/5 Rated</span>
                </div>
                <p>Your information is safe and secure</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Save 30% on Professional Notary Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied Facebook customers who've saved money while getting top-quality mobile notary service.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span className="font-semibold">500+ Happy Customers</span>
            </div>
            <div className="flex items-center">
              <Star className="h-6 w-6 mr-2 fill-white" />
              <span className="font-semibold">4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-6 w-6 mr-2" />
              <span className="font-semibold">Offer Expires Soon!</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacebookCampaignPage; 