"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import { MailOpen, CalendarCheck, Star } from "lucide-react"; // Icons for benefits

const NewsletterSignupPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-0 md:gap-0 bg-white shadow-2xl rounded-xl overflow-hidden">
        {/* Left Column: Informational Content & Benefits */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-teal-600 to-teal-800 text-white order-2 md:order-1">
          <MailOpen className="h-12 w-12 mb-6 text-teal-300" />
          <h2 className="text-3xl font-bold mb-4 leading-tight">Get Exclusive Insights & Offers!</h2>
          <p className="text-lg text-teal-100 mb-8">
            Join our community of informed clients. Subscribe to the Houston Mobile Notary Pros newsletter and stay ahead with:
          </p>
          <ul className="space-y-4 mb-10">
            <li className="flex items-start">
              <CalendarCheck className="h-6 w-6 text-teal-300 mr-3 mt-1 flex-shrink-0" />
              <span className="text-teal-50">
                <strong>Timely Updates:</strong> Be the first to know about new services, regulatory changes, and important notary news.
              </span>
            </li>
            <li className="flex items-start">
              <Star className="h-6 w-6 text-teal-300 mr-3 mt-1 flex-shrink-0" />
              <span className="text-teal-50">
                <strong>Exclusive Offers:</strong> Receive special discounts and promotions available only to our newsletter subscribers.
              </span>
            </li>
            <li className="flex items-start">
              {/* Using a generic check or info icon if MailOpen is too repetitive */}
              <MailOpen className="h-6 w-6 text-teal-300 mr-3 mt-1 flex-shrink-0" /> 
              <span className="text-teal-50">
                <strong>Helpful Tips:</strong> Get practical advice and insights on preparing for notarizations and managing your documents.
              </span>
            </li>
          </ul>
          <p className="text-sm text-teal-200">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>

        {/* Right Column: Signup Form */}
        <div className="p-8 md:p-12 order-1 md:order-2 flex flex-col justify-center">
          <header className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Stay Connected</h1>
            <p className="text-gray-600 mt-2">
              Subscribe below. It only takes a moment!
            </p>
          </header>
          <LeadForm
            ghlFormUrl="https://YOUR_GOHIGHLEVEL_FORM_URL/newsletter-signup" // IMPORTANT: Replace!
            tags={["newsletter_subscriber", "website_signup"]}
            customFields={{
              "lead_source": "Website Newsletter Page"
            }}
            // For newsletter, you might primarily want to ensure email is prominent.
            // Consider creating a simpler version of LeadForm or a new component if only email is needed.
            // For now, all fields will be shown as per LeadForm's current design.
            // To make it feel more like a newsletter signup, we can adjust title/description here.
            formTitle="Join Our Mailing List"
            formDescription="Enter your details to subscribe."
            submitButtonText="Subscribe Now"
            successRedirectUrl="/newsletter-thank-you"
            privacyPolicyLink="/privacy" 
          />
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignupPage; 