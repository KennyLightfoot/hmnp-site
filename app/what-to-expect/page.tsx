import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, CalendarDays, FileTextIcon, BadgeCent, MapPinIcon, PhoneCall, UserCheck, Briefcase, ScanSearch, ClipboardEdit, PenTool, BookUser, MessageSquare, FileCheck2, Smile, ShieldCheck, ArrowRight } from "lucide-react";

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "What to Expect From Your Mobile Notary Visit",
  description: "Step-by-step guide to booking, preparing, and completing a Houston Mobile Notary Pros appointment with confidence.",
  keywords: "mobile notary process, what to expect notary, Houston notary process, notary appointment steps",
  alternates: {
    canonical: `${BASE_URL}/what-to-expect`,
  },
  openGraph: {
    title: "What to Expect From Your Mobile Notary Visit",
    description: "Learn how Houston Mobile Notary Pros handles booking, ID checks, and signing so you can be ready.",
    url: `${BASE_URL}/what-to-expect`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros - What to Expect',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "What to Expect From Your Mobile Notary Visit",
    description: "Get ready for a smooth Houston mobile notary appointment from booking to final seal.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
};

interface StepProps {
  icon: React.ElementType;
  title: string;
  description: string | React.ReactElement;
}

const StepCard: React.FC<StepProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
    <div className="flex items-center mb-3">
      <div className="bg-[#002147] p-2 rounded-full mr-3">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-[#002147]">{title}</h3>
    </div>
    {typeof description === 'string' ? <p className="text-gray-700">{description}</p> : description}
  </div>
);


export default function WhatToExpectPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">
          Your Smooth Signing Experience
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          At Houston Mobile Notary Pros, we believe in clarity and professionalism every step of the way. Here's what you can expect when you choose our mobile notary services.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">1. Before Your Appointment</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <StepCard
            icon={CalendarDays}
            title="Easy Booking"
            description={
              <>
                Schedule your appointment online through our <Link href="/booking" className="text-[#A52A2A] hover:underline font-medium">secure booking system</Link> or by <Link href="/contact" className="text-[#A52A2A] hover:underline font-medium">contacting us directly</Link>. We'll confirm your details and preferred time.
              </>
            }
          />
          <StepCard
            icon={FileTextIcon}
            title="Getting Ready"
            description={
              <ul className="space-y-2 text-gray-700">
                <li><CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />Have your document(s) ready, but <strong>do not sign or date them beforehand</strong>. The notary must witness your signature.</li>
                <li><CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />Ensure all pages of your document are present.</li>
                <li><CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />Know the type of notarization you need (e.g., Acknowledgment, Jurat). If unsure, we can help clarify general requirements but cannot provide legal advice.</li>
              </ul>
            }
          />
          <StepCard
            icon={BadgeCent}
            title="Valid Identification"
            description="All signers must present a valid, unexpired government-issued photo ID. Common forms include a Driver's License, State ID Card, U.S. Passport, or Military ID. The name on your ID should closely match the name on your document."
          />
          <StepCard
            icon={MapPinIcon}
            title="Choosing a Location"
            description="Select a quiet, well-lit, and comfortable location for the signing. This could be your home, office, a coffee shop, or any mutually agreed-upon place. Ensure there's a flat surface for signing."
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">2. On the Day of Your Appointment</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StepCard
            icon={PhoneCall}
            title="Clear Communication"
            description="You'll receive a confirmation of your appointment and an ETA from your notary. We believe in keeping you informed."
          />
          <StepCard
            icon={UserCheck}
            title="Professional Arrival"
            description="Our notary will arrive punctually, dressed professionally, and greet you with a friendly introduction. We respect your time and space."
          />
          <StepCard
            icon={Briefcase}
            title="Prepared For You"
            description="Your notary will have their official seal, notary journal, and necessary supplies. We come fully equipped to handle your notarization needs efficiently."
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">3. During the Notarization</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <StepCard
            icon={ScanSearch}
            title="Identity Verification"
            description="The notary will carefully examine each signer's ID to verify their identity. This is a critical step in preventing fraud and protecting all parties."
          />
          <StepCard
            icon={ClipboardEdit}
            title="Document Guidance"
            description="The notary will guide you to the correct places to sign, date, and initial. We will ensure all notarial certificates are completed accurately. While we explain the notarial act, please remember notaries cannot provide legal advice or interpret document contents."
          />
          <StepCard
            icon={PenTool}
            title="The Signing Process"
            description="Once identities are confirmed and everyone is clear on the document, signers will proceed to sign the document(s) in the notary's presence. We ensure a calm and unhurried environment."
          />
          <StepCard
            icon={BookUser}
            title="Notary Journal Entry"
            description="Details of the notarization (date, time, type of document, signer information) will be recorded in the notary's official journal as required by Texas law. This provides a secure record of the transaction."
          />
           <div className="md:col-span-2">
             <StepCard
                icon={MessageSquare}
                title="Your Questions Answered"
                description="We encourage you to ask any questions you may have about the notarial process itself. Our goal is for you to feel comfortable and confident. We're here to provide clarity and ensure you understand each step of the notarization."
             />
           </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-[#002147] mb-8 text-center">4. After Your Appointment</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StepCard
            icon={FileCheck2}
            title="Your Notarized Documents"
            description="Immediately upon completion, you will receive your properly notarized documents. The notary will affix their seal and signature, making the notarization official."
          />
          <StepCard
            icon={Smile}
            title="Peace of Mind"
            description="You can have confidence knowing that your important documents have been handled with meticulous care, precision, and in full compliance with Texas notary laws."
          />
          <StepCard
            icon={MessageSquare}
            title="We Value Your Feedback"
            description={
              <>
                Your satisfaction is our priority. We welcome your <Link href="/contact#feedback" className="text-[#A52A2A] hover:underline font-medium">feedback</Link> and encourage you to share your experience.
              </>
            }
          />
        </div>
      </section>

      <section className="mb-12 bg-gray-50 p-8 rounded-lg">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <ShieldCheck className="h-12 w-12 text-[#002147]" />
            </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">Our Unwavering Commitment</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            We are dedicated to providing a service that is not only convenient but also embodies professionalism, accuracy, and confidentiality. Our aim is to make every notarization a clear, calm, and reassuring experience for you.
          </p>
          <Link href="/#our-commitment">
            <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
              Read Our Commitment to You
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl font-bold text-[#002147] mb-4">Ready for a Stress-Free Notary Experience?</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Let Houston Mobile Notary Pros handle your important documents with the care and professionalism they deserve.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
              Book an Appointment
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white w-full sm:w-auto">
              Contact Us With Questions
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 