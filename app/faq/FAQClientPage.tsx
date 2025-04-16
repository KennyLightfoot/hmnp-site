"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Phone, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Add this import at the top of the file
import FAQSchema from "@/components/faq-schema"

// FAQ data structure
interface FAQ {
  id: string
  question: string
  answer: React.ReactNode
  category: string
  keywords: string[]
}

// FAQ categories
const categories = [
  { id: "general", name: "General Questions" },
  { id: "services", name: "Our Services" },
  { id: "documents", name: "Document Requirements" },
  { id: "pricing", name: "Pricing & Payment" },
  { id: "scheduling", name: "Scheduling & Availability" },
  { id: "legal", name: "Legal & Compliance" },
]

// FAQ data
const faqs: FAQ[] = [
  // General Questions
  {
    id: "what-is-notary",
    question: "What is a notary public?",
    answer: (
      <div>
        <p>
          A notary public is a state-appointed official who serves as an impartial witness to the signing of important
          documents. Notaries verify the identity of signers, ensure they're signing willingly, and in some cases,
          administer oaths or affirmations.
        </p>
        <p className="mt-2">
          In Texas, notaries are commissioned by the Secretary of State and must follow specific laws and regulations
          governing notarial acts.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["notary", "public", "official", "witness", "texas"],
  },
  {
    id: "why-mobile-notary",
    question: "Why should I use a mobile notary service?",
    answer: (
      <div>
        <p>
          A mobile notary service offers convenience by coming to your location, saving you time and hassle. This is
          especially valuable when:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>You have mobility issues or health concerns</li>
          <li>You're dealing with time-sensitive documents</li>
          <li>You need notarization outside normal business hours</li>
          <li>You have multiple signers at different locations</li>
          <li>You're in a hospital, nursing home, or detention facility</li>
        </ul>
      </div>
    ),
    category: "general",
    keywords: ["mobile", "convenience", "location", "travel", "service"],
  },
  {
    id: "service-area",
    question: "What areas do you serve?",
    answer: (
      <div>
        <p>We serve clients within a 30-mile radius of ZIP code 77591, covering the greater Houston area including:</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <ul className="list-disc list-inside space-y-1">
              <li>Houston</li>
              <li>Galveston</li>
              <li>League City</li>
              <li>Pearland</li>
              <li>Sugar Land</li>
            </ul>
          </div>
          <div>
            <ul className="list-disc list-inside space-y-1">
              <li>Katy</li>
              <li>The Woodlands</li>
              <li>Baytown</li>
              <li>Friendswood</li>
              <li>Missouri City</li>
            </ul>
          </div>
        </div>
        <p className="mt-2">
          We can also travel beyond our standard service area for an additional fee of $0.50 per mile.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["area", "houston", "coverage", "zip", "travel", "radius", "location"],
  },
  {
    id: "response-time",
    question: "How quickly can you respond to a request?",
    answer: (
      <div>
        <p>Our response time depends on the service level you choose:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Essential Service:</strong> Typically requires 24-hour advance notice, but same-day service may be
            available depending on our schedule.
          </li>
          <li>
            <strong>Priority Service:</strong> Guarantees a 2-hour response time, available 7am-9pm daily, including
            weekends.
          </li>
        </ul>
        <p className="mt-2">
          For urgent needs, we recommend our Priority Service package, which ensures the fastest possible response.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["response", "time", "quick", "urgent", "priority", "same-day"],
  },
  {
    id: "what-to-expect",
    question: "What should I expect during a mobile notary appointment?",
    answer: (
      <div>
        <p>During a typical mobile notary appointment:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Our notary will arrive at your specified location at the scheduled time.</li>
          <li>
            The notary will verify the identity of all signers using government-issued photo ID (driver's license,
            passport, etc.).
          </li>
          <li>
            The notary will ensure all signers understand the document(s) and are signing willingly, without coercion.
          </li>
          <li>The signers will sign the document(s) in the presence of the notary.</li>
          <li>The notary will complete the notarial certificate and apply their official seal.</li>
          <li>Payment will be collected at the conclusion of the appointment.</li>
        </ol>
        <p className="mt-2">
          The entire process typically takes 15-30 minutes for standard notarizations, or 60-90 minutes for loan
          signings.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["appointment", "process", "expect", "procedure", "steps"],
  },

  // Our Services
  {
    id: "services-offered",
    question: "What types of notary services do you offer?",
    answer: (
      <div>
        <p>We offer a comprehensive range of mobile notary services:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Essential Mobile Package:</strong> General notarization for wills, POAs, affidavits, etc.
          </li>
          <li>
            <strong>Priority Service Package:</strong> Urgent notarization with 2-hour response time.
          </li>
          <li>
            <strong>Loan Signing Services:</strong> Specialized service for real estate transactions.
          </li>
          <li>
            <strong>Reverse Mortgage/HELOC:</strong> Specialized service for reverse mortgages and home equity loans.
          </li>
          <li>
            <strong>Specialty Services:</strong> Including apostille services, background check verification, and more.
          </li>
          <li>
            <strong>Business Packages:</strong> Tailored solutions for businesses with regular notary needs.
          </li>
        </ul>
        <p className="mt-2">
          Visit our{" "}
          <Link href="/services" className="text-[#002147] underline hover:text-[#A52A2A]">
            Services page
          </Link>{" "}
          for detailed information about each service.
        </p>
      </div>
    ),
    category: "services",
    keywords: ["services", "types", "packages", "offerings", "notarization"],
  },
  {
    id: "loan-signing",
    question: "What is a loan signing agent and how is it different from a regular notary?",
    answer: (
      <div>
        <p>
          A loan signing agent is a notary public who has received additional training specifically for handling real
          estate loan documents. While all loan signing agents are notaries, not all notaries are qualified loan signing
          agents.
        </p>
        <p className="mt-2">Key differences include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Specialized Knowledge:</strong> Loan signing agents understand real estate terminology and the
            structure of loan document packages.
          </li>
          <li>
            <strong>Process Expertise:</strong> They know the correct order and procedure for loan document execution.
          </li>
          <li>
            <strong>Additional Insurance:</strong> Our loan signing agents carry $100k Errors & Omissions insurance.
          </li>
        </ul>
        <p className="mt-2">
          Our loan signing agents are experienced professionals who work with title companies, lenders, and escrow
          officers to ensure smooth and compliant real estate closings.
        </p>
      </div>
    ),
    category: "services",
    keywords: ["loan", "signing", "agent", "real estate", "mortgage", "closing"],
  },
  {
    id: "documents-notarized",
    question: "What types of documents can you notarize?",
    answer: (
      <div>
        <p>We can notarize a wide variety of documents, including but not limited to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Real estate documents (deeds, mortgages, refinancing, etc.)</li>
          <li>Powers of Attorney</li>
          <li>Wills and living wills</li>
          <li>Medical directives</li>
          <li>Affidavits</li>
          <li>Loan documents</li>
          <li>Business agreements</li>
          <li>Adoption papers</li>
          <li>School and education forms</li>
          <li>Vehicle title transfers</li>
          <li>International documents requiring apostille</li>
        </ul>
        <p className="mt-2">
          If you're unsure whether your document requires notarization, please{" "}
          <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
            contact us
          </Link>{" "}
          and we'll be happy to assist.
        </p>
      </div>
    ),
    category: "services",
    keywords: ["documents", "types", "notarize", "papers", "forms"],
  },
  {
    id: "cannot-notarize",
    question: "Are there any documents you cannot notarize?",
    answer: (
      <div>
        <p>Yes, there are certain documents and situations where we cannot provide notarization:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Documents where the signer is not physically present</li>
          <li>Documents where the signer does not have valid identification</li>
          <li>Documents with blank spaces that should be filled in</li>
          <li>Documents where the signer appears to be under duress or coercion</li>
          <li>Documents where the signer does not appear to understand what they're signing</li>
          <li>Documents where the notary is named as a party or will benefit financially (beyond the notary fee)</li>
          <li>Birth certificates, death certificates, or marriage certificates issued by government agencies</li>
          <li>Foreign language documents without proper translation (unless the notary is fluent in that language)</li>
        </ul>
        <p className="mt-2">
          As notaries, we are bound by Texas law regarding what we can and cannot notarize. If you have questions about
          a specific document, please contact us before scheduling an appointment.
        </p>
      </div>
    ),
    category: "services",
    keywords: ["cannot", "restrictions", "limitations", "prohibited", "unable"],
  },

  // Document Requirements
  {
    id: "id-requirements",
    question: "What forms of identification do you accept?",
    answer: (
      <div>
        <p>In accordance with Texas law, we accept the following forms of government-issued photo identification:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Driver's license or state ID card issued by any U.S. state</li>
          <li>U.S. passport or passport card</li>
          <li>U.S. military ID card</li>
          <li>Permanent resident card or alien registration receipt card (Form I-551)</li>
          <li>Foreign passport with temporary I-551 stamp or temporary I-551 printed notation</li>
          <li>Employment authorization document with photograph (Form I-766)</li>
          <li>U.S. Citizenship and Immigration Services ID card</li>
        </ul>
        <p className="mt-2">Important requirements for acceptable ID:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Must be current (not expired)</li>
          <li>Must contain a photograph of the bearer</li>
          <li>Must contain a physical description of the bearer</li>
          <li>Must contain the bearer's signature (unless exempt by statute)</li>
          <li>Must be issued by a governmental entity</li>
        </ul>
        <p className="mt-2">
          If you have questions about whether your ID will be accepted, please contact us before your appointment.
        </p>
      </div>
    ),
    category: "documents",
    keywords: ["identification", "ID", "driver's license", "passport", "requirements"],
  },
  {
    id: "document-preparation",
    question: "Should my documents be prepared before the notary arrives?",
    answer: (
      <div>
        <p>
          Yes, your documents should be fully prepared before the notary appointment, with the following guidelines:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Complete all information</strong> in the document except for signatures and dates that need to be
            witnessed by the notary.
          </li>
          <li>
            <strong>Do not sign the documents</strong> before the notary arrives. The notary must witness your
            signature.
          </li>
          <li>
            <strong>Have all necessary supporting documents</strong> ready, such as trust documents if signing as a
            trustee.
          </li>
          <li>
            <strong>Ensure all signers will be present</strong> with valid identification.
          </li>
          <li>
            <strong>Review the documents</strong> to make sure you understand what you're signing.
          </li>
        </ul>
        <p className="mt-2">
          For loan signings, the documents are typically prepared by the lender or title company and provided to us
          before the appointment.
        </p>
      </div>
    ),
    category: "documents",
    keywords: ["preparation", "prepare", "ready", "before", "signing"],
  },
  {
    id: "witnesses-required",
    question: "Do I need witnesses for my document?",
    answer: (
      <div>
        <p>
          Whether witnesses are required depends on the type of document and its specific requirements. Here are some
          common scenarios:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Wills:</strong> In Texas, wills typically require two witnesses who are not beneficiaries.
          </li>
          <li>
            <strong>Powers of Attorney:</strong> Texas law requires that a durable power of attorney be notarized, but
            witnesses are not legally required (though some institutions may require them).
          </li>
          <li>
            <strong>Deeds:</strong> Generally require notarization but not witnesses in Texas.
          </li>
          <li>
            <strong>Medical Directives:</strong> Often require two witnesses or notarization.
          </li>
        </ul>
        <p className="mt-2">
          If your document requires witnesses, you should arrange for them to be present during the notary appointment.
          In some cases, we may be able to provide a witness for an additional fee, but this should be arranged in
          advance.
        </p>
        <p className="mt-2">
          If you're unsure whether your document requires witnesses, we recommend consulting with the issuing authority
          or an attorney.
        </p>
      </div>
    ),
    category: "documents",
    keywords: ["witnesses", "required", "need", "present", "signature"],
  },
  {
    id: "copies-certification",
    question: "Can you certify copies of documents?",
    answer: (
      <div>
        <p>
          In Texas, notaries public are not authorized to certify copies of most documents. However, there are some
          exceptions and alternatives:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Copy Certification by Document Custodian:</strong> If you are the legal custodian of an original
            document, you can sign a statement (which we can notarize) declaring that the copy is a true and correct
            copy of the original.
          </li>
          <li>
            <strong>Certified Copies of Powers of Attorney:</strong> Texas notaries can make certified copies of powers
            of attorney if the person requesting the copy is named in the document or is a family member.
          </li>
        </ul>
        <p className="mt-2">
          For official documents like birth certificates, marriage certificates, or court records, you should contact
          the issuing agency for certified copies.
        </p>
        <p className="mt-2">
          If you need copies of other documents, we recommend contacting the original issuer or consulting with an
          attorney about the proper procedure.
        </p>
      </div>
    ),
    category: "documents",
    keywords: ["copies", "certify", "certification", "duplicate", "original"],
  },

  // Pricing & Payment
  {
    id: "pricing-structure",
    question: "How much do your notary services cost?",
    answer: (
      <div>
        <p>Our pricing varies based on the service package you select:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Essential Mobile Package:</strong> Starting at $75 for one signer with 1-2 documents. Additional
            signers: $10-20 each.
          </li>
          <li>
            <strong>Priority Service Package:</strong> $100 flat fee for 2-hour response time, up to 5 documents and 2
            signers.
          </li>
          <li>
            <strong>Loan Signing Services:</strong> $150 flat fee for standard loan closings and reverse mortgages.
          </li>
          <li>
            <strong>Specialty Services:</strong> Starting at $55, varies by service type.
          </li>
          <li>
            <strong>Business Packages:</strong> Starting at $125/month, customized to your organization's needs.
          </li>
        </ul>
        <p className="mt-2">
          Additional fees may apply for weekend service (+$50), extended travel beyond 20 miles ($0.50/mile), or extra
          documents.
        </p>
        <p className="mt-2">
          For detailed pricing information, please visit our{" "}
          <Link href="/services" className="text-[#002147] underline hover:text-[#A52A2A]">
            Services page
          </Link>
          .
        </p>
      </div>
    ),
    category: "pricing",
    keywords: ["cost", "price", "fee", "charge", "rates"],
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: (
      <div>
        <p>We accept the following payment methods:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Credit/Debit Cards:</strong> Visa, MasterCard, American Express, Discover (preferred method)
          </li>
          <li>
            <strong>Cash:</strong> Exact change required
          </li>
          <li>
            <strong>Corporate Billing:</strong> Available for approved business accounts
          </li>
        </ul>
        <p className="mt-2">
          Payment is due at the time of service. For business accounts with approved credit, we offer monthly billing
          options.
        </p>
        <p className="mt-2">
          We do not accept personal checks, money orders, or payment apps like Venmo or Cash App at this time.
        </p>
      </div>
    ),
    category: "pricing",
    keywords: ["payment", "pay", "credit card", "cash", "billing"],
  },
  {
    id: "travel-fees",
    question: "Do you charge travel fees?",
    answer: (
      <div>
        <p>Our travel fee policy is as follows:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Standard Service Area:</strong> No travel fees within a 20-mile radius of ZIP code 77591.
          </li>
          <li>
            <strong>Extended Service Area:</strong> $0.50 per mile for locations beyond the 20-mile radius.
          </li>
          <li>
            <strong>Toll Roads:</strong> Any toll fees incurred will be added to the final bill at cost.
          </li>
          <li>
            <strong>Severe Weather Conditions:</strong> During severe weather events, a $0.65/mile fuel surcharge may
            apply for travel beyond our primary service area.
          </li>
        </ul>
        <p className="mt-2">
          Travel fees are calculated based on the round-trip distance from our base location to your appointment
          location.
        </p>
        <p className="mt-2">
          For Priority Service, the extended service area is increased to 35 miles, with the same $0.50/mile fee
          applying beyond that distance.
        </p>
      </div>
    ),
    category: "pricing",
    keywords: ["travel", "fee", "distance", "mileage", "radius"],
  },
  {
    id: "cancellation-policy",
    question: "What is your cancellation policy?",
    answer: (
      <div>
        <p>Our cancellation policy is designed to be fair while respecting our notaries' time:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>24+ Hours Notice:</strong> Full refund of any deposits or prepayments.
          </li>
          <li>
            <strong>2-24 Hours Notice:</strong> No cancellation fee, but any deposits may be converted to a credit for
            future service.
          </li>
          <li>
            <strong>Less than 2 Hours Notice:</strong> $35 cancellation fee may apply.
          </li>
          <li>
            <strong>No-Show:</strong> $50 fee plus travel costs may apply if our notary arrives at the appointment
            location and no one is available.
          </li>
        </ul>
        <p className="mt-2">
          <strong>Weather-Related Cancellations:</strong> For cancellations due to severe weather or other emergencies,
          we offer a 15% discount when rescheduling.
        </p>
        <p className="mt-2">
          <strong>Rescheduling:</strong> Rescheduling with at least 2 hours' notice is free of charge.
        </p>
      </div>
    ),
    category: "pricing",
    keywords: ["cancel", "cancellation", "reschedule", "refund", "policy"],
  },

  // Scheduling & Availability
  {
    id: "hours-operation",
    question: "What are your hours of operation?",
    answer: (
      <div>
        <p>Our service hours vary by service type:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Essential Services:</strong> Monday-Friday, 9am-5pm
          </li>
          <li>
            <strong>Priority Services:</strong> 7 days a week, 7am-9pm
          </li>
          <li>
            <strong>Weekend Services:</strong> Available for all service types with a $50 surcharge
          </li>
          <li>
            <strong>After-Hours Services:</strong> Available from 7-9pm with 24-hour notice and a $30 surcharge
          </li>
          <li>
            <strong>Holiday Services:</strong> Available for Priority Service with a $40 surcharge
          </li>
        </ul>
        <p className="mt-2">
          Our office phone is answered Monday-Friday from 8am-6pm. Outside of these hours, you can leave a message or
          book online, and we'll respond as soon as possible.
        </p>
        <p className="mt-2">
          For urgent needs outside our standard hours, we recommend booking our Priority Service online.
        </p>
      </div>
    ),
    category: "scheduling",
    keywords: ["hours", "operation", "availability", "schedule", "time"],
  },
  {
    id: "appointment-scheduling",
    question: "How do I schedule an appointment?",
    answer: (
      <div>
        <p>You can schedule an appointment with us in several ways:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Online Booking:</strong> The fastest method is through our{" "}
            <Link href="/booking" className="text-[#002147] underline hover:text-[#A52A2A]">
              online booking system
            </Link>
            , available 24/7.
          </li>
          <li>
            <strong>Phone:</strong> Call us at (123) 456-7890 during business hours (Monday-Friday, 8am-6pm).
          </li>
          <li>
            <strong>Email:</strong> Send your request to info@houstonmobilenotarypros.com with your preferred date,
            time, location, and service type.
          </li>
          <li>
            <strong>Contact Form:</strong> Fill out our{" "}
            <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
              contact form
            </Link>{" "}
            with your appointment details.
          </li>
        </ul>
        <p className="mt-2">
          <strong>For Priority Service</strong> (2-hour response time), we recommend booking online or by phone for the
          fastest confirmation.
        </p>
        <p className="mt-2">
          <strong>For Loan Signings</strong>, please have your title company or lender information ready when booking.
        </p>
      </div>
    ),
    category: "scheduling",
    keywords: ["schedule", "appointment", "book", "reservation", "arrange"],
  },
  {
    id: "advance-notice",
    question: "How much advance notice do you need to schedule an appointment?",
    answer: (
      <div>
        <p>The advance notice required depends on the service type and your flexibility:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Priority Service:</strong> No advance notice required - we guarantee a 2-hour response time.
          </li>
          <li>
            <strong>Essential Service:</strong> 24 hours' notice is recommended, though same-day appointments may be
            available.
          </li>
          <li>
            <strong>Loan Signings:</strong> 24-48 hours' notice is preferred to ensure proper coordination with title
            companies.
          </li>
          <li>
            <strong>Weekend Appointments:</strong> 48 hours' notice is recommended due to higher demand.
          </li>
          <li>
            <strong>Specialty Services:</strong> Varies by service type; apostille services may require additional
            processing time.
          </li>
        </ul>
        <p className="mt-2">
          For the best availability and scheduling options, we recommend booking as far in advance as possible,
          especially for specific time slots or weekend appointments.
        </p>
        <p className="mt-2">
          If you have an urgent need with less than the recommended notice, please call us directly to check
          availability.
        </p>
      </div>
    ),
    category: "scheduling",
    keywords: ["advance", "notice", "ahead", "time", "schedule"],
  },
  {
    id: "appointment-length",
    question: "How long does a typical appointment take?",
    answer: (
      <div>
        <p>The duration of an appointment varies based on the service type and complexity:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Standard Notarizations:</strong> 15-30 minutes for 1-3 documents with 1-2 signers.
          </li>
          <li>
            <strong>Multiple Signers/Documents:</strong> Add approximately 10 minutes per additional signer or 5 minutes
            per additional document.
          </li>
          <li>
            <strong>Loan Signings:</strong> 60-90 minutes for a typical loan package.
          </li>
          <li>
            <strong>Reverse Mortgages:</strong> 90-120 minutes due to additional required explanations.
          </li>
          <li>
            <strong>Specialty Services:</strong> Varies by service type; apostille document preparation may take 30-45
            minutes.
          </li>
        </ul>
        <p className="mt-2">
          These are estimates, and the actual time may vary based on the specific circumstances of your appointment.
          Factors that can affect duration include the complexity of documents, number of signers, and whether all
          parties are prepared with proper identification.
        </p>
        <p className="mt-2">
          When scheduling, we recommend allowing some buffer time to ensure a relaxed and thorough notarization process.
        </p>
      </div>
    ),
    category: "scheduling",
    keywords: ["length", "duration", "time", "appointment", "how long"],
  },
  {
    id: "rescheduling",
    question: "What if I need to reschedule my appointment?",
    answer: (
      <div>
        <p>We understand that plans can change. Here's our policy for rescheduling appointments:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>More than 2 hours' notice:</strong> You can reschedule at no additional cost, subject to
            availability.
          </li>
          <li>
            <strong>Less than 2 hours' notice:</strong> A $15 rescheduling fee may apply.
          </li>
          <li>
            <strong>Weather-related rescheduling:</strong> If you need to reschedule due to severe weather, we offer a
            15% discount on your rescheduled appointment.
          </li>
        </ul>
        <p className="mt-2">
          To reschedule, please call us at (123) 456-7890 or email info@houstonmobilenotarypros.com with your booking
          reference number and preferred new date and time.
        </p>
        <p className="mt-2">
          We'll do our best to accommodate your new preferred time, but availability may be limited, especially for
          same-day rescheduling.
        </p>
      </div>
    ),
    category: "scheduling",
    keywords: ["reschedule", "change", "appointment", "date", "time"],
  },

  // Legal & Compliance
  {
    id: "legal-limitations",
    question: "What are the legal limitations of a notary public?",
    answer: (
      <div>
        <p>As notaries public in Texas, we are bound by specific legal limitations:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Cannot provide legal advice:</strong> We cannot explain legal documents, advise on their content, or
            recommend whether you should sign them.
          </li>
          <li>
            <strong>Cannot prepare legal documents:</strong> We cannot draft wills, contracts, deeds, or other legal
            documents.
          </li>
          <li>
            <strong>Cannot advise on immigration matters:</strong> We cannot provide advice or services related to
            immigration processes beyond notarization.
          </li>
          <li>
            <strong>Cannot certify copies of most documents:</strong> With limited exceptions, Texas notaries cannot
            certify copies of documents.
          </li>
          <li>
            <strong>Cannot notarize incomplete documents:</strong> Documents must be complete (no blank spaces) before
            notarization.
          </li>
          <li>
            <strong>Cannot notarize for absent signers:</strong> The signer must be physically present.
          </li>
          <li>
            <strong>Cannot notarize our own documents:</strong> We cannot notarize documents in which we have a
            financial or beneficial interest.
          </li>
        </ul>
        <p className="mt-2">
          These limitations are established by Texas Government Code Chapter 406 and are designed to maintain the
          impartiality and integrity of the notarial process.
        </p>
        <p className="mt-2">For legal advice or document preparation, we recommend consulting with an attorney.</p>
      </div>
    ),
    category: "legal",
    keywords: ["legal", "limitations", "restrictions", "cannot", "prohibited"],
  },
  {
    id: "notary-credentials",
    question: "What credentials do your notaries have?",
    answer: (
      <div>
        <p>All of our notaries maintain the following credentials and qualifications:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>State Commission:</strong> Current commission as a Notary Public by the Texas Secretary of State.
          </li>
          <li>
            <strong>E&O Insurance:</strong> $100,000 Errors & Omissions insurance coverage.
          </li>
          <li>
            <strong>Background Check:</strong> All notaries have passed comprehensive background checks.
          </li>
          <li>
            <strong>Continuing Education:</strong> Regular participation in notary education and training programs.
          </li>
          <li>
            <strong>Loan Signing Certification:</strong> Our loan signing agents have additional specialized training
            and certification.
          </li>
          <li>
            <strong>Professional Membership:</strong> Active membership in professional notary associations.
          </li>
        </ul>
        <p className="mt-2">
          We maintain strict compliance with all Texas notary laws and regulations, including proper record-keeping in
          notary journals and secure storage of our notary seals.
        </p>
        <p className="mt-2">
          Our notaries also receive training in customer service, professionalism, and security protocols to ensure a
          positive and legally compliant experience for all clients.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["credentials", "qualifications", "commission", "insurance", "certification"],
  },
  {
    id: "privacy-policy",
    question: "How do you protect my personal information?",
    answer: (
      <div>
        <p>We take the privacy and security of your personal information very seriously:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Secure Notary Journals:</strong> Information recorded in our notary journals is kept secure and
            confidential, accessible only as required by law.
          </li>
          <li>
            <strong>Limited Data Collection:</strong> We collect only the information necessary to perform notarial acts
            and provide our services.
          </li>
          <li>
            <strong>Secure Document Handling:</strong> We do not keep copies of your notarized documents unless
            specifically requested for record-keeping purposes.
          </li>
          <li>
            <strong>Digital Security:</strong> Our digital systems use encryption and secure protocols to protect your
            information.
          </li>
        </ul>
        <p className="mt-2">
          We do not sell or share your personal information with third parties except as required to complete your
          requested services or as required by law.
        </p>
        <p className="mt-2">
          For a complete explanation of our privacy practices, please review our full Privacy Policy on our website.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["privacy", "information", "security", "confidential", "data"],
  },
  {
    id: "legal-disclaimer",
    question: "What is your legal disclaimer?",
    answer: (
      <div>
        <p>In accordance with Texas Government Code §406.017:</p>
        <div className="bg-gray-100 p-4 border-l-4 border-[#A52A2A] italic my-4">
          "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL
          ADVICE."
        </div>
        <p>As notaries public, we:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Cannot provide legal advice or explain the contents or effects of documents</li>
          <li>Cannot prepare legal documents or fill in forms beyond adding notarial wording</li>
          <li>Cannot advise which type of notarization is needed for your document</li>
          <li>Cannot represent you in legal proceedings</li>
        </ul>
        <p className="mt-2">
          Our role is strictly limited to verifying identity, witnessing signatures, and performing notarial acts as
          authorized by Texas law.
        </p>
        <p className="mt-2">
          For questions about your documents or legal matters, please consult with an attorney. If you need a referral
          to an attorney, we can provide contact information for local bar associations.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["disclaimer", "legal", "attorney", "practice", "advice"],
  },
]

export default function FAQClientPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>(faqs)
  const [activeCategory, setActiveCategory] = useState("all")

  // Filter FAQs based on search query and active category
  useEffect(() => {
    let filtered = faqs

    // Filter by category if not "all"
    if (activeCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
      )
    }

    setFilteredFAQs(filtered)
  }, [searchQuery, activeCategory])

  // Count FAQs by category
  const faqCounts = categories.reduce(
    (acc, category) => {
      acc[category.id] = faqs.filter((faq) => faq.category === category.id).length
      return acc
    },
    { all: faqs.length } as Record<string, number>,
  )

  // Add this right before the return statement in the component
  // ...
  return (
    <>
      <FAQSchema />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our mobile notary services. If you don't see your question here,
            please contact us directly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
              <h2 className="text-xl font-bold text-[#002147] mb-4">Categories</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeCategory === "all" ? "bg-[#002147] text-white" : "hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setActiveCategory("all")}
                  >
                    All Categories <span className="text-sm ml-1">({faqCounts.all})</span>
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeCategory === category.id ? "bg-[#002147] text-white" : "hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.name} <span className="text-sm ml-1">({faqCounts[category.id]})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="md:col-span-3">
            {searchQuery && (
              <p className="mb-4 text-gray-600">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? "result" : "results"} found for "{searchQuery}"
              </p>
            )}

            {filteredFAQs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any FAQs matching your search. Please try different keywords or browse by category.
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-semibold text-[#002147]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-gray-50">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-[#002147] text-white p-8 rounded-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="mb-6">
                If you couldn't find the answer you were looking for, our team is here to help. Contact us directly and
                we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#002147]"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  (281) 779-8847
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Common Inquiries</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                  <span>Scheduling same-day appointments</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                  <span>Special requests for business clients</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                  <span>International document authentication</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                  <span>Custom service packages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
