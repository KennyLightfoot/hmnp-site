"use client";

import LeadForm from "@/components/lead-form";
import { NextPage } from "next";
import { MapPin, Phone, Mail, Building } from "lucide-react"; // Relevant icons
import Link from "next/link";

const GMBContactPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <header className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="container mx-auto px-6">
          <Building className="mx-auto h-12 w-12 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
            Welcome, Google User!
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
            Found us on Google My Business? We're ready to assist you. Get in touch easily using the form below or find our direct contact details.
          </p>
        </div>
      </header>

      <main className="py-12 md:py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-x-12 gap-y-16 items-start">
          {/* Left Column: Lead Form */}
          <div className="bg-white p-8 rounded-xl shadow-2xl lg:p-10 order-2 md:order-1">
            <LeadForm
              ghlFormUrl="https://api.leadconnectorhq.com/widget/form/5vbNyTCwTDm4MyuQNnj5"
              tags={["gmb_lead", "organic_search", "direct_contact_inquiry"]}
              customFields={{
                "lead_source": "Google My Business - Contact Page"
              }}
              submitButtonText="Send Your Message"
              formTitle="Quick Contact Form"
              formDescription="Please provide your details, and we'll get back to you promptly."
              successRedirectUrl="/contact/thank-you-gmb"
              privacyPolicyLink="/privacy"
              termsOfServiceLink="/terms"
            />
          </div>

          {/* Right Column: Direct Contact Info & Map Placeholder */}
          <div className="space-y-8 order-1 md:order-2">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Direct Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-7 w-7 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-medium text-gray-700">Call Us</h3>
                    <a href="tel:YOUR_PHONE_NUMBER" className="text-lg text-blue-700 hover:text-blue-800 hover:underline">YOUR_PHONE_NUMBER_DISPLAY</a>
                    <p className="text-sm text-gray-500">Mon - Fri, 9 AM - 6 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-7 w-7 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-medium text-gray-700">Email Us</h3>
                    <a href="mailto:YOUR_EMAIL_ADDRESS" className="text-lg text-blue-700 hover:text-blue-800 hover:underline">YOUR_EMAIL_ADDRESS</a>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-7 w-7 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-medium text-gray-700">Service Area</h3>
                    <p className="text-lg text-gray-700">Proudly serving the Greater Houston Area. We come to you!</p>
                    {/* Optional: Link to a more detailed service areas page */}
                    {/* <Link href="/service-areas" className="text-sm text-blue-700 hover:underline">View detailed service map</Link> */}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Placeholder for a small map or an image of your service area / team */}
            <div className="bg-gray-200 h-56 rounded-lg flex items-center justify-center text-gray-500 mt-10">
              [Optional: Embed Google Map or Service Area Image]
            </div>
             <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 mt-8">Why Trust Houston Mobile Notary Pros?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-lg">
                <li><span className="font-medium">Google Verified:</span> Recognized on Google My Business for reliable service.</li>
                <li><span className="font-medium">Client-Focused:</span> We prioritize your convenience and schedule.</li>
                <li><span className="font-medium">Expert Notaries:</span> Professional, certified, and background-checked.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GMBContactPage; 