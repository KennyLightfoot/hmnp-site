"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import Link from "next/link";
import { MailOpen, CalendarCheck, Star, Gift, CheckCircle, ArrowRight, Bell, Users, Zap } from "lucide-react";
import MobileDock from "@/components/MobileDock";
import { track } from "@/app/lib/analytics";
import { useVariant } from "@/app/lib/abTesting";

const NewsletterSignupPage: NextPage = () => {
  const heroVariant = useVariant('nl_signup_hero', 'A') as 'A' | 'B'
  const primaryCtaText = heroVariant === 'A' ? 'Start Getting Insights' : 'Join The Newsletter'
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#A52A2A]/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#002147]/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-100/30 rounded-full blur-2xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Value Proposition */}
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-full text-sm font-medium mb-8">
                  <Bell className="h-4 w-4 mr-2" />
                  Join 2,000+ Houston Residents
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight font-serif">
                  Stay Ahead with Exclusive 
                  <span className="text-primary"> Notary Insights</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Get insider access to expert tips, regulatory updates, and exclusive offers that help you 
                  navigate document notarization with confidence. Join Houston's most informed community.
                </p>

                {/* Key Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary p-2 rounded-full flex-shrink-0">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary mb-1">Weekly Expert Tips</h4>
                      <p className="text-gray-600 text-sm">Practical advice on document preparation, notary laws, and best practices from certified professionals.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary p-2 rounded-full flex-shrink-0">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary mb-1">Subscriber-Only Discounts</h4>
                      <p className="text-gray-600 text-sm">Exclusive promotions and early access to special pricing on our notary services.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary p-2 rounded-full flex-shrink-0">
                      <CalendarCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary mb-1">Priority Booking Alerts</h4>
                      <p className="text-gray-600 text-sm">Be first to know about available time slots and get priority access to our calendar.</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#A52A2A] mb-1">2,000+</div>
                      <div className="text-sm text-gray-600">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#A52A2A] mb-1">98%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#A52A2A] mb-1">Weekly</div>
                      <div className="text-sm text-gray-600">Updates</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Unsubscribe anytime</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Free forever</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Signup Form */}
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
                      <MailOpen className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary mb-3">Join Our Community</h2>
                    <p className="text-gray-600">
                      Get started with exclusive notary insights delivered to your inbox.
                    </p>
                  </div>

                  <LeadForm
                    apiEndpoint="/api/submit-newsletter-lead"
                    tags={["newsletter_subscriber", "website_signup", "lead_magnet"]}
                    customFields={{
                      "lead_source": "Website Newsletter Page",
                      "signup_method": "Newsletter Landing Page"
                    }}
                    formTitle=""
                    formDescription=""
                    submitButtonText={primaryCtaText}
                    successRedirectUrl="/newsletter-thank-you"
                    privacyPolicyLink="/privacy"
                  />

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      By subscribing, you agree to receive our newsletter and promotional emails. 
                      You can unsubscribe at any time. Read our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Get Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#002147] mb-4">What You'll Get in Your Inbox</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our newsletter is packed with valuable content designed to make your notary experience smooth and informed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Expert Guidance</h3>
                <p className="text-gray-600 mb-4">
                  Monthly deep-dives into notary best practices, document preparation tips, and regulatory updates from our certified professionals.
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-2">
                  <li>• Document preparation checklists</li>
                  <li>• Texas notary law updates</li>
                  <li>• Common mistake prevention</li>
                  <li>• Professional insights</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow border-2 border-primary">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <div className="text-center mb-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">MOST VALUABLE</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Exclusive Offers</h3>
                <p className="text-gray-600 mb-4">
                  Subscriber-only promotions, early bird pricing, and special packages not available to the general public.
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-2">
                  <li>• First access to promotions</li>
                  <li>• Subscriber-only discounts</li>
                  <li>• Free consultation offers</li>
                  <li>• Priority booking windows</li>
                </ul>
              </div>

              <div className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Timely Updates</h3>
                <p className="text-gray-600 mb-4">
                  Stay informed about service changes, new offerings, and important announcements that affect your notary needs.
                </p>
                <ul className="text-sm text-gray-500 text-left space-y-2">
                  <li>• Service announcements</li>
                  <li>• Schedule availability alerts</li>
                  <li>• Industry news summaries</li>
                  <li>• Policy change notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-secondary mb-4 font-serif">What Our Subscribers Say</h2>
              <p className="text-xl text-gray-600">
                Join thousands of Houston residents who trust our insights.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "The newsletter helped me understand exactly what documents I needed for my estate planning. 
                  The tips saved me time and made the whole process much smoother."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">Sarah Chen</div>
                    <div className="text-sm text-gray-500">Estate Planning Client</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "I love getting the exclusive offers! I've saved over $100 on notary services this year 
                  just by being a newsletter subscriber. The content is always helpful too."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">Michael Rodriguez</div>
                    <div className="text-sm text-gray-500">Business Owner</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "The updates about Texas notary laws have been invaluable for my real estate business. 
                  I always know I'm working with current information and best practices."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">Amanda Foster</div>
                    <div className="text-sm text-gray-500">Real Estate Agent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-r from-secondary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Become a More Informed Client?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of informed Houston residents and start receiving expert notary insights today. 
              It's free, valuable, and you can unsubscribe anytime.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-8">
              <h3 className="text-lg font-semibold mb-4">🎁 Bonus for New Subscribers:</h3>
              <p className="text-blue-100">
                Get our comprehensive "Document Preparation Checklist" immediately after signing up - 
                a $25 value, absolutely free!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); track('cta_clicked', { cta_name: primaryCtaText, location: 'final_cta', lp: 'newsletter-signup' }) }} 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg shadow font-semibold transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40">
                {primaryCtaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <Link
                href="/services"
                onClick={() => track('cta_clicked', { cta_name: 'Learn About Our Services', location: 'final_cta_secondary', lp: 'newsletter-signup' })}
                className="border-2 border-white text-white hover:bg-white hover:text-secondary px-8 py-4 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40">
                Learn About Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>
      <MobileDock />
    </div>
  );
};

export default NewsletterSignupPage; 