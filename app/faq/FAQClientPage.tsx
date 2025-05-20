"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Phone, ChevronRight, ArrowRight, Mail, Clock, HelpCircle, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import FAQSchema from "@/components/faq-schema"

// FAQ data structure
interface FAQ {
  id: string
  question: string
  answer: React.ReactNode
  category: string
  keywords: string[]
  relatedQuestions?: string[]
  popular?: boolean
}

// FAQ categories
const categories = [
  { id: "general", name: "General Questions", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "services", name: "Our Services", icon: <Clock className="h-4 w-4" /> },
  { id: "documents", name: "Document Requirements", icon: <Filter className="h-4 w-4" /> },
  { id: "pricing", name: "Pricing & Payment", icon: <ChevronRight className="h-4 w-4" /> },
  { id: "scheduling", name: "Scheduling & Availability", icon: <Clock className="h-4 w-4" /> },
  { id: "legal", name: "Legal & Compliance", icon: <Filter className="h-4 w-4" /> },
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
          governing notarial acts. The primary role of a notary is to help deter fraud by verifying the identity of
          document signers and ensuring they understand what they're signing.
        </p>
        <p className="mt-2">Notaries are authorized to perform several official acts, including:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Taking acknowledgments</li>
          <li>Administering oaths and affirmations</li>
          <li>Taking depositions</li>
          <li>Certifying copies of certain documents</li>
          <li>Protesting instruments permitted by law</li>
        </ul>
      </div>
    ),
    category: "general",
    keywords: ["notary", "public", "official", "witness", "texas", "notarial acts", "state-appointed"],
    popular: true,
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
          <li>You have mobility issues or health concerns that make travel difficult</li>
          <li>You're dealing with time-sensitive documents that need immediate attention</li>
          <li>You need notarization outside normal business hours when traditional notary offices are closed</li>
          <li>You have multiple signers at different locations who need to sign the same documents</li>
          <li>You're in a hospital, nursing home, detention facility, or other location with limited access</li>
          <li>You have a busy schedule and can't afford to take time off work to visit a notary office</li>
          <li>You need a notary for a large signing event with multiple documents and signers</li>
        </ul>
        <p className="mt-2">
          Our mobile notary service brings professional notarization directly to your home, office, coffee shop, or any
          other convenient location. We work around your schedule, not the other way around, making the entire process
          stress-free and efficient.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Mobile notaries are especially valuable for real estate transactions, where
            multiple documents need to be signed and notarized in a specific order. Our loan signing specialists can
            guide you through the entire process at your location.
          </p>
        </div>
      </div>
    ),
    category: "general",
    keywords: ["mobile", "convenience", "location", "travel", "service", "time-saving", "accessibility"],
    relatedQuestions: ["service-area", "response-time", "what-to-expect"],
    popular: true,
  },
  {
    id: "service-area",
    question: "What areas do you serve?",
    answer: (
      <div>
        <p>
          Our primary service point is based in Texas City (ZIP 77591). Our standard service packages include travel
          within a 20-mile radius of this location.
        </p>
        <p className="mt-2">We proudly serve the greater Houston area, including but not limited to:</p>
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
          We gladly travel to all listed areas and beyond. An additional travel fee of $0.50 per mile applies for
          distances beyond the initial 20 miles from 77591. Please see our Travel Fees question for more details or
          contact us for a precise quote.
        </p>
        <div className="mt-4">
          <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
            Contact us to check if we serve your specific location
          </Link>
        </div>
      </div>
    ),
    category: "general",
    keywords: ["area", "houston", "coverage", "zip", "travel", "radius", "location", "service area", "texas city", "fee"],
    relatedQuestions: ["travel-fees", "response-time"],
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
            available depending on our schedule. We'll do our best to accommodate urgent requests within our standard
            service hours (Monday-Friday, 9am-5pm).
          </li>
          <li>
            <strong>Priority Service:</strong> Guarantees a 2-hour response time, available 7am-9pm daily, including
            weekends and most holidays. This is our premium service designed specifically for urgent notarization needs.
          </li>
        </ul>
        <p className="mt-2">
          For urgent needs, we recommend our Priority Service package, which ensures the fastest possible response. This
          service includes SMS status updates and extended service hours to accommodate even the most time-sensitive
          situations.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Quick Tip:</strong> When booking online, select "Priority Service" and note the urgency of your
            request in the special instructions field. For immediate assistance, call us directly at (832) 617-4285.
          </p>
        </div>
      </div>
    ),
    category: "general",
    keywords: ["response", "time", "quick", "urgent", "priority", "same-day", "fast", "immediate", "emergency"],
    relatedQuestions: ["appointment-scheduling", "hours-operation"],
  },
  {
    id: "what-to-expect",
    question: "What should I expect during a mobile notary appointment?",
    answer: (
      <div>
        <p>During a typical mobile notary appointment:</p>
        <ol className="list-decimal list-inside mt-2 space-y-2">
          <li>
            <strong>Arrival:</strong> Our notary will arrive at your specified location at the scheduled time, dressed
            professionally and carrying all necessary equipment (notary seal, journal, pens, etc.).
          </li>
          <li>
            <strong>Identity Verification:</strong> The notary will verify the identity of all signers using
            government-issued photo ID (driver's license, passport, etc.). This step is required by law and cannot be
            skipped.
          </li>
          <li>
            <strong>Document Review:</strong> The notary will briefly review the documents to determine what type of
            notarization is needed and ensure all documents are complete (no blank spaces that should be filled in).
          </li>
          <li>
            <strong>Signer Awareness Check:</strong> The notary will ensure all signers understand the document(s) and
            are signing willingly, without coercion. The notary cannot explain legal terms but can ensure signers are
            aware of what they're signing.
          </li>
          <li>
            <strong>Document Signing:</strong> The signers will sign the document(s) in the presence of the notary.
          </li>
          <li>
            <strong>Notarial Certificate:</strong> The notary will complete the notarial certificate (acknowledgment,
            jurat, etc.) and apply their official seal.
          </li>
          <li>
            <strong>Journal Entry:</strong> The notary will record the transaction in their notary journal, which may
            require signers to provide a thumbprint (for certain documents) and signature.
          </li>
          <li>
            <strong>Payment:</strong> Payment will be collected at the conclusion of the appointment.
          </li>
        </ol>
        <p className="mt-2">
          The entire process typically takes 15-30 minutes for standard notarizations, or 60-90 minutes for loan
          signings with multiple documents.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Preparation Tip:</strong> Have all signers present with valid ID, and have your documents ready but
            unsigned. This will help ensure a smooth and efficient appointment.
          </p>
        </div>
      </div>
    ),
    category: "general",
    keywords: ["appointment", "process", "expect", "procedure", "steps", "notarization", "signing"],
    relatedQuestions: ["id-requirements", "document-preparation"],
  },
  {
    id: "difference-notarization-types",
    question: "What's the difference between an acknowledgment, jurat, and oath?",
    answer: (
      <div>
        <p>These are different types of notarial acts, each serving a specific purpose:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Acknowledgment</h3>
            <p className="mt-1">
              An acknowledgment is a formal declaration by a signer that they have signed a document voluntarily and for
              the purposes stated in the document. The signer must personally appear before the notary, but may have
              already signed the document before the notarization.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Common uses:</strong> Deeds, mortgages, powers of attorney
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Jurat (Verification Upon Oath or Affirmation)</h3>
            <p className="mt-1">
              A jurat requires the signer to sign the document in the notary's presence and take an oath or affirmation
              that the contents of the document are true. The notary certifies that the signer appeared before them, was
              sworn in, and signed the document.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Common uses:</strong> Affidavits, depositions, sworn statements
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Oath or Affirmation</h3>
            <p className="mt-1">
              An oath is a solemn pledge to a higher power, while an affirmation is a solemn pledge on one's personal
              honor. Both are verbal ceremonies where the person swears or affirms that the statements they are making
              are true. This may be performed independently or as part of a jurat.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Common uses:</strong> Sworn testimony, oaths of office
            </p>
          </div>
        </div>
        <p className="mt-4">
          The type of notarization required is usually specified in the document itself or determined by the purpose of
          the document. If you're unsure which type you need, the document recipient or issuing authority can typically
          provide guidance.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["acknowledgment", "jurat", "oath", "affirmation", "notarial acts", "types", "differences"],
    relatedQuestions: ["what-is-notary", "documents-notarized"],
  },

  // Our Services
  {
    id: "services-offered",
    question: "What types of notary services do you offer?",
    answer: (
      <div>
        <p>We offer a comprehensive range of mobile notary services to meet various needs:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Essential Mobile Package</h3>
            <p className="mt-1">
              General notarization for wills, POAs, affidavits, and other standard documents. Starting at $75 for one
              signer with 1-2 documents.
            </p>
            <Link href="/services/essential" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Essential Mobile Package →
            </Link>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Priority Service Package</h3>
            <p className="mt-1">
              Urgent notarization with 2-hour response time, available 7am-9pm daily. $100 flat fee includes up to 5
              documents and 2 signers.
            </p>
            <Link href="/services/priority" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Priority Service Package →
            </Link>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Loan Signing Services</h3>
            <p className="mt-1">
              Specialized service for real estate transactions, including purchase loans, refinances, and more. $150
              flat fee includes unlimited documents and up to 4 signers.
            </p>
            <Link href="/services/loan-signing" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Loan Signing Services →
            </Link>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Reverse Mortgage/HELOC</h3>
            <p className="mt-1">
              Specialized service for reverse mortgages and home equity loans. $150 flat fee includes in-depth
              explanation of forms and certified mail return.
            </p>
            <Link href="/services/loan-signing" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Reverse Mortgage Services →
            </Link>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Specialty Services</h3>
            <p className="mt-1">
              Including apostille services, background check verification, wedding certificate expediting, and medallion
              signatures. Starting at $55.
            </p>
            <Link href="/services/specialty" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Specialty Services →
            </Link>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Business Packages</h3>
            <p className="mt-1">
              Tailored solutions for businesses with regular notary needs, including title companies, healthcare
              providers, and educational institutions. Starting at $125/month.
            </p>
            <Link href="/services/business" className="text-sm text-[#A52A2A] hover:underline">
              Learn more about Business Packages →
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/services" className="text-[#002147] font-medium hover:text-[#A52A2A] flex items-center">
            View all our services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["services", "types", "packages", "offerings", "notarization", "mobile notary", "loan signing"],
    relatedQuestions: ["loan-signing", "pricing-structure"],
    popular: true,
  },
  {
    id: "loan-signing",
    question: "What is a loan signing agent and how is it different from a regular notary?",
    answer: (
      <div>
        <p>
          A loan signing agent (LSA) is a notary public who has received additional training specifically for handling
          real estate loan documents. While all LSAs are notaries, not all notaries are qualified LSAs.
        </p>
        <p className="mt-2">Key differences include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Specialized Knowledge:</strong> LSAs understand real estate terminology, loan document packages,
            and the specific requirements of different types of loans (Conventional, FHA, VA, Purchase, Refinance,
            HELOC, Reverse Mortgage, etc.).
          </li>
          <li>
            <strong>Process Expertise:</strong> They know the correct order and procedure for loan document execution,
            ensuring all documents are properly signed, initialed, and dated according to lender requirements.
          </li>
          <li>
            <strong>Additional Training & Certification:</strong> LSAs typically complete specialized training programs
            and hold certifications from recognized organizations like the National Notary Association (NNA) or Loan
            Signing System (LSS). {/* TODO: Confirm and list specific certifications held */}
          </li>
          <li>
            <strong>Enhanced Insurance:</strong> Due to the high value of transactions, professional LSAs carry
            significant Errors & Omissions (E&O) insurance. We maintain comprehensive E&O coverage. {/* TODO: Specify E&O level ($1M Recommended) */}
          </li>
          <li>
            <strong>Industry Relationships:</strong> Experienced LSAs maintain relationships with title companies,
            escrow officers, and lenders to facilitate smooth closings.
          </li>
        </ul>
        <p className="mt-2">
          Our loan signing agents are experienced professionals dedicated to ensuring smooth, accurate, and compliant
          real estate closings.
        </p>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Important Note:</strong> While LSAs are knowledgeable about loan documents, they cannot provide
            legal advice or explain the legal implications of the documents being signed. Their role is to facilitate
            the signing process, not to interpret the documents.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["loan", "signing", "agent", "real estate", "mortgage", "closing", "NSA", "LSA", "difference", "certified", "NNA", "LSS", "E&O"],
    relatedQuestions: ["services-offered", "documents-notarized"],
  },
  {
    id: "provide-witnesses",
    question: "Can you provide witnesses if my document requires them?",
    answer: (
      <div>
        <p>
          Some documents, like certain wills or real estate documents, may require one or more witnesses in addition to
          the notary. Witnesses must be impartial, over 18, and not named in the document or benefiting from it.
        </p>
        <p className="mt-2">
          Generally, signers are responsible for providing their own witnesses. However, if you are unable to arrange
          for witnesses, please let us know when booking your appointment. We may be able to provide witnesses for an
          additional fee, subject to availability. Advance notice (at least 24-48 hours) is required for witness
          requests.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Please Note:</strong> The notary public cannot act as a witness for the same document they are
            notarizing.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["witness", "witnesses", "provide", "document", "signing", "additional fee"],
    relatedQuestions: ["what-to-expect", "document-preparation"],
  },
  {
    id: "offer-ron",
    question: "Do you offer Remote Online Notarization (RON)?",
    answer: (
      <div>
        <p>
          Currently, Houston Mobile Notary Pros focuses on providing in-person mobile notary and loan signing services.
          We do not offer Remote Online Notarization (RON) at this time.
        </p>
        <p className="mt-2">
          RON allows notarizations to be performed remotely using audiovisual technology. While it offers convenience in
          some situations, our mobile service provides face-to-face verification and assistance directly at your
          location.
        </p>
        {/* Optional: Add if considering RON in the future */}
        {/* <p className="mt-2">
          We are continuously evaluating our service offerings and may consider adding RON in the future. Please check back
          for updates.
        </p> */}
      </div>
    ),
    category: "services",
    keywords: ["ron", "remote", "online", "notarization", "virtual", "video", "webcam"],
    relatedQuestions: ["services-offered", "why-mobile-notary"],
  },
  {
    id: "documents-notarized",
    question: "What types of documents can you notarize?",
    answer: (
      <div>
        <p>We can notarize a wide variety of documents, including but not limited to:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Real Estate Documents</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Deeds (warranty, quitclaim, etc.)</li>
              <li>Mortgage documents</li>
              <li>Refinancing packages</li>
              <li>Home equity loans</li>
              <li>Closing documents</li>
              <li>Property transfers</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Personal Documents</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Powers of Attorney</li>
              <li>Wills and living wills</li>
              <li>Medical directives</li>
              <li>Consent for minor travel</li>
              <li>Pension documents</li>
              <li>Name change documents</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Business Documents</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Business agreements</li>
              <li>Corporate bylaws</li>
              <li>Partnership agreements</li>
              <li>Commercial leases</li>
              <li>Business certifications</li>
              <li>Board resolutions</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Other Common Documents</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Affidavits</li>
              <li>Vehicle title transfers</li>
              <li>School and education forms</li>
              <li>Adoption papers</li>
              <li>International documents</li>
              <li>Employment verifications</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          If you're unsure whether your document requires notarization, please{" "}
          <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
            contact us
          </Link>{" "}
          and we'll be happy to assist. The document issuer or recipient can also typically provide guidance on
          notarization requirements.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Pro Tip:</strong> Check your document for a notary section, which typically includes language like
            "subscribed and sworn to before me" or "acknowledged before me" and has a designated space for a notary seal
            and signature.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["documents", "types", "notarize", "papers", "forms", "real estate", "personal", "business"],
    relatedQuestions: ["cannot-notarize", "difference-notarization-types"],
    popular: true,
  },
  {
    id: "cannot-notarize",
    question: "Are there any documents you cannot notarize?",
    answer: (
      <div>
        <p>
          Yes, there are certain documents and situations where we cannot provide notarization due to legal restrictions
          or ethical considerations:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Absent Signers:</strong> Documents where the signer is not physically present at the time of
            notarization. Remote online notarization is a separate service not currently offered.
          </li>
          <li>
            <strong>Insufficient Identification:</strong> Documents where the signer does not have valid, acceptable
            identification as required by Texas law.
          </li>
          <li>
            <strong>Incomplete Documents:</strong> Documents with blank spaces that should be filled in before
            notarization.
          </li>
          <li>
            <strong>Duress or Coercion:</strong> Documents where the signer appears to be under duress, coercion, or
            does not appear to be signing willingly.
          </li>
          <li>
            <strong>Lack of Awareness:</strong> Documents where the signer does not appear to understand what they're
            signing or appears to be mentally incapacitated.
          </li>
          <li>
            <strong>Conflict of Interest:</strong> Documents where the notary is named as a party or will benefit
            financially (beyond the notary fee).
          </li>
          <li>
            <strong>Vital Records:</strong> Birth certificates, death certificates, or marriage certificates issued by
            government agencies cannot be notarized (though copies may be handled differently).
          </li>
          <li>
            <strong>Foreign Language Documents:</strong> Documents in a language the notary doesn't understand, unless
            accompanied by a certified translation or the notary is fluent in that language.
          </li>
        </ul>
        <p className="mt-2">
          As notaries, we are bound by Texas law regarding what we can and cannot notarize. These restrictions are in
          place to maintain the integrity of the notarial process and protect all parties involved.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Note:</strong> If you have questions about a specific document, please contact us before scheduling
            an appointment. We're happy to discuss your situation and provide guidance on whether notarization is
            possible.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["cannot", "restrictions", "limitations", "prohibited", "unable", "illegal", "not allowed"],
    relatedQuestions: ["documents-notarized", "legal-limitations"],
  },
  {
    id: "mobile-vs-office",
    question: "What's the difference between using a mobile notary and going to a notary office?",
    answer: (
      <div>
        <p>
          There are several key differences between using a mobile notary service like ours and visiting a traditional
          notary office:
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Mobile Notary Advantages</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>
                <strong>Convenience:</strong> We come to your location, saving you travel time and hassle
              </li>
              <li>
                <strong>Flexible Scheduling:</strong> Available evenings, weekends, and even on short notice
              </li>
              <li>
                <strong>Privacy:</strong> Notarization happens in your chosen environment
              </li>
              <li>
                <strong>Time Efficiency:</strong> No waiting in line or office delays
              </li>
              <li>
                <strong>Multiple Signers:</strong> Easier to coordinate when everyone can meet at one location
              </li>
              <li>
                <strong>Personalized Service:</strong> One-on-one attention throughout the process
              </li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Traditional Notary Office</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>
                <strong>Fixed Location:</strong> You must travel to their office during business hours
              </li>
              <li>
                <strong>Limited Hours:</strong> Typically only open during standard business hours
              </li>
              <li>
                <strong>Potential Waiting:</strong> May need to wait for service if others are ahead of you
              </li>
              <li>
                <strong>Lower Cost:</strong> May have slightly lower fees for basic services
              </li>
              <li>
                <strong>Public Environment:</strong> Less privacy during document signing
              </li>
              <li>
                <strong>Limited Expertise:</strong> May not specialize in specific document types
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-4">Mobile notary services are particularly valuable for:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Busy professionals who can't take time off work</li>
          <li>Elderly or individuals with mobility challenges</li>
          <li>Real estate transactions with multiple documents</li>
          <li>Time-sensitive documents requiring immediate attention</li>
          <li>Situations requiring multiple signers to be present</li>
          <li>Confidential documents where privacy is important</li>
        </ul>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Value Consideration:</strong> While mobile notary services typically cost more than visiting an
            office, the time saved and convenience provided often far outweigh the additional cost, especially when
            considering travel time, parking, and potential waiting periods at traditional offices.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["mobile", "office", "difference", "comparison", "advantages", "traditional", "convenience"],
    relatedQuestions: ["why-mobile-notary", "pricing-structure"],
  },

  // Document Requirements
  {
    id: "id-requirements",
    question: "What are the specific ID requirements in Texas?",
    answer: (
      <div>
        <p>
          Texas law requires notaries to verify the identity of signers using specific forms of identification. The ID
          must be current (unexpired) and issued by the federal government or a state government. It must contain the
          signer's photograph and signature.
        </p>
        <p className="mt-2">Acceptable forms of primary identification include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Texas Driver's License or State ID Card</li>
          <li>U.S. Driver's License or State ID Card from another state</li>
          <li>U.S. Passport or Passport Card</li>
          <li>U.S. Military ID Card</li>
          <li>Foreign Passport stamped by U.S. Citizenship and Immigration Services (USCIS)</li>
          <li>Inmate ID Card issued by the Texas Department of Criminal Justice (TDCJ) or federal detention facility (if signer is incarcerated)</li>
        </ul>
        <p className="mt-2">
          The ID must be original; photocopies are not acceptable. The name on the ID should generally match the name
          on the document being signed. Minor variations may be acceptable, but significant discrepancies might prevent
          notarization.
        </p>
        <p className="mt-2">
          <strong>What if a signer doesn't have acceptable ID?</strong>
        </p>
        <p className="mt-1">
          If a signer lacks acceptable ID, Texas law allows for identification through **Credible Witnesses**. A
          credible witness must personally know the signer, be personally known by the notary, and present their own
          valid ID to the notary. The witness must swear or affirm to the signer's identity and sign the notary journal.
          Please contact us in advance if you believe credible witnesses will be needed, as specific requirements apply.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Note:</strong> Expired IDs generally cannot be accepted. Ensuring all signers have valid ID before
            the appointment saves time and avoids potential issues.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["id", "identification", "requirements", "texas", "driver's license", "passport", "military id", "valid", "unexpired", "photo", "signature", "credible witness"],
    relatedQuestions: ["bring-to-appointment", "what-to-expect"],
    popular: true,
  },
  {
    id: "document-preparation",
    question: "Should I fill out the document completely before the notary arrives?",
    answer: (
      <div>
        <p>
          Please ensure your document is fully completed *except* for the signature and any notary-specific sections.
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Do Fill In:</strong> All personal information, dates (unless the date needs to be the date of
            signing), specific details required by the document.
          </li>
          <li>
            <strong>Do Not Fill In / Sign:</strong>
            <ul className="list-circle list-inside ml-4 mt-1">
              <li>The signature line(s). Signatures must typically be done in the notary's presence.</li>
              <li>The Notarial Certificate section (often titled "Acknowledgment" or "Jurat"). This part is for the
                notary only.</li>
            </ul>
          </li>
        </ul>
        <p className="mt-2">
          Having the document otherwise complete saves time during the appointment. If you have questions about filling
          out the document, please consult the document issuer or an attorney, as the notary cannot provide legal advice
          or assist in preparing your document.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Important:</strong> Do not sign the document before the notary arrives unless instructed otherwise
            (e.g., for an acknowledgment where prior signing is permitted). Signing in front of the notary is usually
            required.
          </p>
        </div>
      </div>
    ),
    category: "documents",
    keywords: ["document", "fill out", "complete", "prepare", "sign", "signature", "before", "notary section"],
    relatedQuestions: ["what-to-expect", "notary-legal-advice"],
    popular: true,
  },
  {
    id: "bring-to-appointment",
    question: "What do I need to bring to the appointment?",
    answer: (
      <div>
        <p>To ensure a smooth appointment, please have the following ready:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>The Complete Document(s):</strong> Ensure you have the entire, original document(s) needing
            notarization. Please review them for completeness (except signatures and notary sections) beforehand.
          </li>
          <li>
            <strong>All Signers Present:</strong> Every person who needs to sign the document must be physically present
            at the appointment time.
          </li>
          <li>
            <strong>Valid Government-Issued Photo ID:</strong> Each signer must present a valid (unexpired) photo ID
            issued by the state or federal government. See our "ID Requirements" FAQ for details.
          </li>
          <li>
            <strong>Witnesses (If Required):</strong> If your document requires witnesses, ensure they are present with
            their own valid IDs. (See our "Witnesses" FAQ).
          </li>
          <li>
            <strong>Payment Method:</strong> We accept various payment methods (please confirm acceptable forms when
            booking or see our Pricing section).
          </li>
        </ul>
        <p className="mt-2">
          Having everything prepared helps make the notarization process quick and efficient.
        </p>
      </div>
    ),
    category: "documents",
    keywords: ["bring", "appointment", "documents", "id", "signers", "witnesses", "payment", "prepare"],
    relatedQuestions: ["id-requirements", "document-preparation", "provide-witnesses"],
    popular: true,
  },

  // Pricing & Payment
  {
    id: "pricing-structure",
    question: "How much do your notary services cost?",
    answer: (
      <div>
        <p>Our pricing varies based on the service package you select:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Essential Mobile Package</h3>
            <p className="mt-1">
              <strong>Starting at $75</strong> for one signer with 1-2 documents.
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Two Signers: $85 (up to 3 documents per signer)</li>
              <li>Three Signers: $95 (up to 3 documents per signer)</li>
              <li>Four+ Signers: Custom quote</li>
              <li>Additional documents: $5 each</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Priority Service Package</h3>
            <p className="mt-1">
              <strong>$100 flat fee</strong> for 2-hour response time, up to 5 documents and 2 signers.
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Additional signers: $10 each</li>
              <li>Extended service area up to 35 miles</li>
              <li>Available 7am-9pm daily</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Loan Signing Services</h3>
            <p className="mt-1">
              <strong>$150 flat fee</strong> for standard loan closings and reverse mortgages.
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Unlimited documents</li>
              <li>Up to 4 signers included</li>
              <li>90-minute signing session</li>
              <li>Overnight document handling: +$35 (if needed)</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Specialty Services</h3>
            <p className="mt-1">
              <strong>Starting at $55</strong>, varies by service type.
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Background Check Verification: $55</li>
              <li>Wedding Certificate Expediting: $75</li>
              <li>Apostille Services: $75 + state fees</li>
              <li>Medallion Signature: $95</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Additional Fees</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Weekend service: +$50 flat fee</li>
              <li>Extended travel beyond 20 miles: $0.50/mile</li>
              <li>After-hours service (7-9pm): +$30</li>
              <li>Holiday service: +$40</li>
              <li>Bilingual service (Spanish): +$20</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          For detailed pricing information, please visit our{" "}
          <Link href="/services" className="text-[#002147] underline hover:text-[#A52A2A]">
            Services page
          </Link>
          . For business packages and volume discounts, please{" "}
          <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
            contact us
          </Link>{" "}
          directly.
        </p>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Transparency Note:</strong> Our fees include both the statutory notary fees authorized by Texas law
            and our professional service fees for travel, preparation, and expertise. All fees will be clearly itemized
            on your receipt.
          </p>
        </div>
      </div>
    ),
    category: "pricing",
    keywords: ["cost", "price", "fee", "charge", "rates", "pricing", "payment", "how much"],
    relatedQuestions: ["payment-methods", "travel-fees"],
    popular: true,
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer: (
      <div>
        <p>We accept the following payment methods:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Credit/Debit Cards</h3>
            <p className="mt-1">
              We accept all major credit and debit cards, including Visa, MasterCard, American Express, and Discover.
              This is our preferred payment method for most transactions.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Note:</strong> A secure payment hold may be placed at booking, which is released immediately after
              successful payment.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cash</h3>
            <p className="mt-1">Cash is accepted with the following conditions:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>A $50 security hold is required when booking with cash payment</li>
              <li>Exact change is required - our notaries do not carry change</li>
              <li>Receipt will be provided for all cash transactions</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Corporate Billing</h3>
            <p className="mt-1">Available for approved business accounts with the following features:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Monthly invoicing with detailed transaction records</li>
              <li>Volume discounts for regular clients</li>
              <li>Customized billing arrangements available</li>
              <li>Requires credit application and approval</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          Payment is due at the time of service unless other arrangements have been made in advance. For business
          accounts with approved credit, we offer monthly billing options.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Important:</strong> We do not accept personal checks, money orders, or payment apps like Venmo or
            Cash App at this time. For loan signings, payment arrangements are often made through the title company or
            lender.
          </p>
        </div>
      </div>
    ),
    category: "pricing",
    keywords: ["payment", "pay", "credit card", "cash", "billing", "methods", "accept"],
    relatedQuestions: ["pricing-structure", "cancellation-policy"],
  },
  {
    id: "travel-fees",
    question: "How are travel fees calculated?",
    answer: (
      <div>
        <p>
          Our standard service packages (Essential, Priority, Loan Signing, etc.) include travel within a 20-mile
          radius of our base location in Texas City (ZIP 77591).
        </p>
        <p className="mt-2">
          For locations beyond this initial 20-mile radius, an additional travel fee applies. This fee is calculated at
          <strong>$0.50 per mile for the round trip distance traveled *beyond* the first 20 miles each way</strong> (i.e., beyond 40 miles round trip).
        </p>
        <p className="mt-2">
          Example: If your location is 30 miles from 77591:
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
          <li>One way distance: 30 miles</li>
          <li>Round trip distance: 60 miles</li>
          <li>Included round trip distance: 40 miles (20 miles each way)</li>
          <li>Billable round trip distance: 20 miles (60 total - 40 included)</li>
          <li>Additional Travel Fee: 20 miles * $0.50/mile = $10.00</li>
        </ul>
        <p className="mt-2">
          We use standard mapping services (like Google Maps) to determine the distance from ZIP 77591 to your signing
          location. The travel fee will be calculated and confirmed with you when booking your appointment.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            Please{" "}
            <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
              contact us
            </Link>{" "}
            if you need a precise quote including travel fees for your specific location.
          </p>
        </div>
      </div>
    ),
    category: "pricing",
    keywords: ["travel fee", "mileage", "distance", "cost", "charge", "additional", "calculation", "radius", "zip 77591"],
    relatedQuestions: ["service-area", "pricing-structure"],
    popular: true,
  },
  {
    id: "additional-fees",
    question: "Are there additional fees for weekends, holidays, or after-hours service?",
    answer: (
      <div>
        <p>Yes, additional fees may apply in certain situations:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Weekend Service:</strong> Appointments scheduled on Saturdays or Sundays may incur a weekend
            surcharge (e.g., +$50 for Essential/Loan Signing, included in Priority). Please check specific package
            details or confirm when booking.
          </li>
          <li>
            <strong>Holiday Service:</strong> Service on major holidays (e.g., New Year's Day, Thanksgiving, Christmas)
            may be available at premium rates and subject to availability. Please inquire directly.
          </li>
          <li>
            <strong>After-Hours Service:</strong> Our Priority Service covers extended hours (7am-9pm). Services requested
            outside these hours, if available, may be subject to after-hours fees.
          </li>
          <li>
            <strong>Excessive Wait Time:</strong> If the notary has to wait significantly beyond the scheduled
            appointment time due to signer unpreparedness or other delays caused by the client, a waiting fee may apply
            (e.g., after the first 15 minutes).
          </li>
          <li>
            <strong>Additional Services:</strong> Fees apply for services beyond standard notarization, such as
            witness provision, document printing, scanning, or shipping.
          </li>
        </ul>
        <p className="mt-2">
          All applicable fees, including travel and any surcharges, will be clearly communicated and agreed upon before
          your appointment is confirmed.
        </p>
      </div>
    ),
    category: "pricing",
    keywords: ["additional fee", "surcharge", "weekend", "holiday", "after hours", "wait time", "extra cost"],
    relatedQuestions: ["travel-fees", "pricing-structure"],
  },

  // Scheduling & Availability
  {
    id: "hours-operation",
    question: "What are your hours of operation?",
    answer: (
      <div>
        <p>Our service hours vary by service type:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Essential Services</h3>
            <p className="mt-1">
              <strong>Monday-Friday:</strong> 9am-5pm
            </p>
            <p className="mt-1 text-sm text-gray-600">
              These are our standard business hours for regular notary services.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Priority Services</h3>
            <p className="mt-1">
              <strong>7 days a week:</strong> 7am-9pm
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Our extended hours for urgent notarization needs, available every day including weekends.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Weekend Services</h3>
            <p className="mt-1">
              <strong>Saturday & Sunday:</strong> 9am-5pm
            </p>
            <p className="mt-1 text-sm text-gray-600">Available for all service types with a $50 weekend surcharge.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">After-Hours Services</h3>
            <p className="mt-1">
              <strong>Monday-Friday:</strong> 5pm-9pm
            </p>
            <p className="mt-1 text-sm text-gray-600">Available with 24-hour notice and a $30 surcharge.</p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Holiday Services</h3>
            <p className="mt-1">
              Available for Priority Service with a $40 surcharge. Please contact us in advance to confirm holiday
              availability.
            </p>
          </div>
        </div>
        <p className="mt-4">
          <strong>Office Phone Hours:</strong> Our office phone is answered Monday-Friday from 8am-6pm. Outside of these
          hours, you can leave a message or book online, and we'll respond as soon as possible.
        </p>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Tip:</strong> For urgent needs outside our standard hours, we recommend booking our Priority Service
            online. This service guarantees a 2-hour response time, even during evenings and weekends.
          </p>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["hours", "operation", "availability", "schedule", "time", "business hours", "when"],
    relatedQuestions: ["appointment-scheduling", "response-time"],
  },
  {
    id: "appointment-scheduling",
    question: "How do I schedule an appointment?",
    answer: (
      <div>
        <p>You can schedule an appointment with us in several ways:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Online Booking</h3>
            <p className="mt-1">
              The fastest method is through our{" "}
              <Link href="/booking" className="text-[#002147] underline hover:text-[#A52A2A]">
                online booking system
              </Link>
              , available 24/7. This allows you to:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Select your preferred service type</li>
              <li>Choose available dates and times</li>
              <li>Provide location and document details</li>
              <li>Receive immediate confirmation</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Phone</h3>
            <p className="mt-1">
              Call us at (281) 779-8847 during business hours (Monday-Friday, 8am-6pm) to speak with our scheduling
              team. We can answer questions and help find the best appointment time for your needs.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Email</h3>
            <p className="mt-1">
              Send your request to contact@houstonmobilenotarypros.com with your preferred date, time, location, and
              service type. Please include:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Your name and contact information</li>
              <li>Type of documents needing notarization</li>
              <li>Number of signers</li>
              <li>Preferred appointment window</li>
              <li>Location address</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Contact Form</h3>
            <p className="mt-1">
              Fill out our{" "}
              <Link href="/contact" className="text-[#002147] underline hover:text-[#A52A2A]">
                contact form
              </Link>{" "}
              with your appointment details. We'll respond to confirm your appointment.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="p-3 border-l-4 border-[#A52A2A] bg-[#A52A2A]/5">
            <h3 className="font-semibold text-[#002147]">For Priority Service (2-hour response time)</h3>
            <p className="mt-1">
              We recommend booking online or by phone for the fastest confirmation. When selecting Priority Service,
              please ensure your phone is available for immediate follow-up.
            </p>
          </div>

          <div className="p-3 border-l-4 border-[#002147] bg-[#002147]/5">
            <h3 className="font-semibold text-[#002147]">For Loan Signings</h3>
            <p className="mt-1">
              Please have your title company or lender information ready when booking. We may need to coordinate
              directly with them to receive the loan documents.
            </p>
          </div>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["schedule", "appointment", "book", "reservation", "arrange", "booking"],
    relatedQuestions: ["advance-notice", "hours-operation"],
    popular: true,
  },
  {
    id: "advance-notice",
    question: "How much advance notice do you need to schedule an appointment?",
    answer: (
      <div>
        <p>The advance notice required depends on the service type and your flexibility:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Priority Service</h3>
            <p className="mt-1">
              <strong>No advance notice required</strong> - we guarantee a 2-hour response time, 7 days a week from
              7am-9pm. This service is specifically designed for urgent, same-day notarization needs.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Essential Service</h3>
            <p className="mt-1">
              <strong>24 hours' notice is recommended</strong>, though same-day appointments may be available depending
              on our schedule. For same-day essential services, we have a 3pm cutoff time for 5pm appointments.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Loan Signings</h3>
            <p className="mt-1">
              <strong>24-48 hours' notice is preferred</strong> to ensure proper coordination with title companies and
              receipt of loan documents. Rush loan signings can sometimes be accommodated with less notice.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Weekend Appointments</h3>
            <p className="mt-1">
              <strong>48 hours' notice is recommended</strong> due to higher demand. Weekend slots fill quickly,
              especially during busy real estate seasons.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Specialty Services</h3>
            <p className="mt-1">
              <strong>Varies by service type</strong>; apostille services may require additional processing time. Please
              contact us directly for specialty service scheduling.
            </p>
          </div>
        </div>
        <p className="mt-4">
          For the best availability and scheduling options, we recommend booking as far in advance as possible,
          especially for specific time slots or weekend appointments.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Urgent Need Tip:</strong> If you have an urgent need with less than the recommended notice, please
            call us directly at (281) 779-8847 to check availability. We'll do our best to accommodate your request,
            even on short notice.
          </p>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["advance", "notice", "ahead", "time", "schedule", "urgent", "same-day"],
    relatedQuestions: ["appointment-scheduling", "response-time"],
  },
  {
    id: "appointment-length",
    question: "How long does a typical appointment take?",
    answer: (
      <div>
        <p>The duration of an appointment varies based on the service type and complexity:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Standard Notarizations</h3>
            <p className="mt-1">
              <strong>15-30 minutes</strong> for 1-3 documents with 1-2 signers. This includes time for ID verification,
              document review, signing, notarization, and journal entries.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Multiple Signers/Documents</h3>
            <p className="mt-1">
              Add approximately <strong>10 minutes per additional signer</strong> or{" "}
              <strong>5 minutes per additional document</strong>. More complex documents may take longer.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Loan Signings</h3>
            <p className="mt-1">
              <strong>60-90 minutes</strong> for a typical loan package. This includes time to review all documents,
              explain where to sign, witness signatures, and complete notarizations.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Reverse Mortgages</h3>
            <p className="mt-1">
              <strong>90-120 minutes</strong> due to additional required explanations and the complexity of these
              transactions. Reverse mortgages typically have more documents and requirements.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Specialty Services</h3>
            <p className="mt-1">
              <strong>Varies by service type</strong>; apostille document preparation may take 30-45 minutes, while
              background check verifications might take 20-30 minutes.
            </p>
          </div>
        </div>
        <p className="mt-4">
          These are estimates, and the actual time may vary based on the specific circumstances of your appointment.
          Factors that can affect duration include:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>The complexity of documents</li>
          <li>Number of signers and their familiarity with the documents</li>
          <li>Whether all parties are prepared with proper identification</li>
          <li>Questions that arise during the signing process</li>
          <li>Special requirements for certain document types</li>
        </ul>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Planning Tip:</strong> When scheduling, we recommend allowing some buffer time to ensure a relaxed
            and thorough notarization process. It's better to allocate more time than you think you'll need, especially
            for important documents.
          </p>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["length", "duration", "time", "appointment", "how long", "minutes", "hours"],
    relatedQuestions: ["what-to-expect", "document-preparation"],
  },
  {
    id: "rescheduling",
    question: "What if I need to reschedule my appointment?",
    answer: (
      <div>
        <p>We understand that plans can change. Here's our policy for rescheduling appointments:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">More than 2 hours' notice</h3>
            <p className="mt-1">
              You can reschedule at no additional cost, subject to availability. We'll work with you to find a new time
              that fits your schedule.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Less than 2 hours' notice</h3>
            <p className="mt-1">
              A $15 rescheduling fee may apply to cover administrative costs and schedule adjustments. This fee helps us
              maintain flexibility while ensuring our notaries' time is respected.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Weather-related rescheduling</h3>
            <p className="mt-1">
              If you need to reschedule due to severe weather or other emergency situations, we offer a 15% discount on
              your rescheduled appointment. Safety is our priority.
            </p>
          </div>
        </div>
        <p className="mt-4">To reschedule, please contact us through one of these methods:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            <strong>Phone:</strong> Call us at (281) 779-8847 (fastest method for urgent rescheduling)
          </li>
          <li>
            <strong>Email:</strong> Send a request to contact@houstonmobilenotarypros.com with your booking reference
            number and preferred new date and time
          </li>
          <li>
            <strong>Online:</strong> Log into your account on our website and use the reschedule option
          </li>
        </ul>
        <p className="mt-4">
          We'll do our best to accommodate your new preferred time, but availability may be limited, especially for
          same-day rescheduling or popular time slots.
        </p>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Rescheduling Tip:</strong> When rescheduling, try to provide at least two alternative time slots
            that would work for you. This increases the chances of finding a suitable replacement appointment.
          </p>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["reschedule", "change", "appointment", "date", "time", "modify", "adjust"],
    relatedQuestions: ["cancellation-policy", "appointment-scheduling"],
  },

  // Legal & Compliance
  {
    id: "legal-limitations",
    question: "What are the legal limitations of a notary public?",
    answer: (
      <div>
        <p>As notaries public in Texas, we are bound by specific legal limitations:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cannot provide legal advice</h3>
            <p className="mt-1">
              We cannot explain legal documents, advise on their content, recommend whether you should sign them, or
              interpret legal terminology. Only licensed attorneys can provide legal advice.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cannot prepare legal documents</h3>
            <p className="mt-1">
              We cannot draft wills, contracts, deeds, or other legal documents. We can only notarize documents that
              have already been prepared.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cannot advise on document types</h3>
            <p className="mt-1">
              We cannot advise you on which type of document you need for your situation or which type of notarization
              is appropriate. This determination should be made by the document recipient or an attorney.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cannot certify copies of most documents</h3>
            <p className="mt-1">
              With limited exceptions (such as powers of attorney in certain circumstances), Texas notaries cannot
              certify copies of documents. We can, however, notarize a statement from the document custodian attesting
              that a copy is true and correct.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Cannot notarize in certain situations</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>When the signer is not physically present</li>
              <li>When the document contains blank spaces that should be filled in</li>
              <li>When the signer appears to be under duress or lacks capacity</li>
              <li>When the notary has a direct financial or beneficial interest in the transaction</li>
              <li>When the signer cannot be properly identified</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          These limitations are established by Texas Government Code Chapter 406 and are designed to maintain the
          impartiality and integrity of the notarial process. Our role is strictly limited to verifying identity,
          witnessing signatures, and performing notarial acts as authorized by Texas law.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Important:</strong> For legal advice or document preparation, we recommend consulting with an
            attorney. If you need a referral to an attorney, we can provide contact information for local bar
            associations.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["legal", "limitations", "restrictions", "cannot", "prohibited", "unauthorized", "law"],
    relatedQuestions: ["legal-disclaimer", "cannot-notarize"],
  },
  {
    id: "notary-credentials",
    question: "What credentials do your notaries have?",
    answer: (
      <div>
        <p>All of our notaries maintain the following credentials and qualifications:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">State Commission</h3>
            <p className="mt-1">
              Current commission as a Notary Public by the Texas Secretary of State. This requires passing a background
              check, completing required training, and maintaining good standing with the state.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Insurance Coverage</h3>
            <p className="mt-1">
              $100,000 Errors & Omissions (E&O) insurance coverage. This insurance protects all parties involved in the
              notarization process and demonstrates our commitment to professionalism.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Background Verification</h3>
            <p className="mt-1">
              All notaries have passed comprehensive background checks, ensuring the highest level of integrity and
              trustworthiness when handling your sensitive documents.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Professional Training</h3>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>
                <strong>Continuing Education:</strong> Regular participation in notary education and training programs
              </li>
              <li>
                <strong>Loan Signing Certification:</strong> Our loan signing agents have additional specialized
                training
              </li>
              <li>
                <strong>Professional Development:</strong> Ongoing training in best practices and legal updates
              </li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Professional Affiliations</h3>
            <p className="mt-1">Active membership in professional notary associations, including:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>National Notary Association</li>
              <li>Texas Notary Association</li>
              <li>American Association of Notaries</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          We maintain strict compliance with all Texas notary laws and regulations, including proper record-keeping in
          notary journals and secure storage of our notary seals. Our notaries also receive training in customer
          service, professionalism, and security protocols to ensure a positive and legally compliant experience for all
          clients.
        </p>
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            <strong>Quality Assurance:</strong> We regularly review our notaries' performance and maintain high
            standards for professionalism and accuracy. Our team is selected not only for their technical qualifications
            but also for their commitment to excellent service.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["credentials", "qualifications", "commission", "insurance", "certification", "background", "training"],
    relatedQuestions: ["legal-limitations", "legal-disclaimer"],
  },
  {
    id: "privacy-policy",
    question: "How do you protect my personal information?",
    answer: (
      <div>
        <p>We take the privacy and security of your personal information very seriously:</p>
        <div className="mt-3 space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Secure Notary Journals</h3>
            <p className="mt-1">
              Information recorded in our notary journals is kept secure and confidential, accessible only as required
              by law. These journals are stored in locked, secure locations when not in use.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Limited Data Collection</h3>
            <p className="mt-1">
              We collect only the information necessary to perform notarial acts and provide our services. This
              typically includes:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
              <li>Name and contact information</li>
              <li>Type of document being notarized</li>
              <li>Type of notarization performed</li>
              <li>Date and location of service</li>
              <li>ID information (as required by law)</li>
              <li>Thumbprint (for certain documents, as required by law)</li>
            </ul>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Secure Document Handling</h3>
            <p className="mt-1">
              We do not keep copies of your notarized documents unless specifically requested for record-keeping
              purposes. When document copies are retained, they are stored securely and accessible only to authorized
              personnel.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Digital Security</h3>
            <p className="mt-1">
              Our digital systems use encryption and secure protocols to protect your information. We employ
              industry-standard security measures for all electronic communications and data storage.
            </p>
          </div>

          <div className="p-3 border border-gray-200 rounded-md">
            <h3 className="font-semibold text-[#002147]">Staff Training</h3>
            <p className="mt-1">
              All our notaries and staff receive training on privacy protection and confidentiality requirements. We
              understand the sensitive nature of many notarized documents and treat all information accordingly.
            </p>
          </div>
        </div>
        <p className="mt-4">
          We do not sell or share your personal information with third parties except as required to complete your
          requested services or as required by law. Your information is used solely for the purpose of providing notary
          services and maintaining required records.
        </p>
        <div className="mt-4 p-3 bg-[#002147]/10 rounded-md">
          <p className="text-sm text-[#002147]">
            <strong>Privacy Commitment:</strong> For a complete explanation of our privacy practices, please review our
            full Privacy Policy on our website. If you have specific concerns about data privacy, please don't hesitate
            to discuss them with us before your appointment.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["privacy", "information", "security", "confidential", "data", "protection", "secure"],
    relatedQuestions: ["notary-credentials", "legal-limitations"],
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
          <li>Cannot recommend whether you should or should not sign a document</li>
          <li>Cannot explain the legal implications of your documents</li>
        </ul>
        <p className="mt-2">
          Our role is strictly limited to verifying identity, witnessing signatures, and performing notarial acts as
          authorized by Texas law. We maintain impartiality in all transactions and cannot act as an advocate for any
          party.
        </p>
        <p className="mt-2">
          For questions about your documents or legal matters, please consult with an attorney. If you need a referral
          to an attorney, we can provide contact information for local bar associations.
        </p>
        <div className="mt-4 p-3 bg-[#A52A2A]/10 rounded-md">
          <p className="text-sm text-[#A52A2A]">
            <strong>Important Note:</strong> While we cannot provide legal advice, we can answer questions about the
            notarization process itself. Feel free to ask us about notary procedures, requirements, and logistics.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["disclaimer", "legal", "attorney", "practice", "advice", "limitations", "restrictions"],
    relatedQuestions: ["legal-limitations", "notary-credentials"],
  },
  {
    id: "notary-legal-advice",
    question: "Can the notary give me legal advice or help prepare my documents?",
    answer: (
      <div>
        <p>
          No. Notaries public, including loan signing agents, are strictly prohibited from providing legal advice or
          assisting in the preparation of legal documents unless they are also a licensed attorney.
        </p>
        <p className="mt-2">Our role is to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Verify the identity of the signer(s).</li>
          <li>Ensure the signer(s) appear willing and aware.</li>
          <li>Administer oaths or affirmations when required.</li>
          <li>Complete the notarial certificate accurately.</li>
          <li>Record the transaction in the notary journal.</li>
        </ul>
        <p className="mt-2">
          We cannot explain the legal meaning or consequences of the documents you are signing, advise you on which
          document form to use, or help you fill out sections of the document beyond the notary certificate itself.
        </p>
        <p className="mt-2">
          If you have questions about the content of your document or need legal advice, please consult with a qualified
          attorney or the person/entity who drafted the document before scheduling your notary appointment.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["legal advice", "prepare documents", "explain", "attorney", "lawyer", "notary role", "prohibited"],
    relatedQuestions: ["what-is-notary", "document-preparation"],
  },
  {
    id: "notary-family",
    question: "Can you notarize documents for family members?",
    answer: (
      <div>
        <p>
          While Texas law doesn't explicitly prohibit notarizing for relatives, it strongly advises against it if the
          notary has a direct financial or beneficial interest in the transaction (beyond the standard notary fee).
          Notarizing for family can create the appearance of a conflict of interest, potentially leading to the
          notarization being challenged later.
        </p>
        <p className="mt-2">
          To maintain impartiality and avoid any potential issues, it is generally best practice for notaries to avoid
          notarizing documents for close family members (spouse, parents, children, siblings) especially if the document
          involves significant financial transactions or property transfers where the notary might indirectly benefit.
        </p>
        <p className="mt-2">
          We reserve the right to decline a notarization if we perceive a potential conflict of interest that could compromise
          our impartiality as required by Texas law.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["family", "relative", "spouse", "parent", "child", "conflict of interest", "impartiality", "prohibited"],
    relatedQuestions: ["notary-legal-advice"],
  },
  {
    id: "insured-bonded",
    question: "Are your notaries insured and bonded?",
    answer: (
      <div>
        <p>
          Yes. All our notaries are commissioned by the State of Texas and maintain the required $10,000 Notary Bond.
        </p>
        <p className="mt-2">
          Furthermore, for your protection and ours, Houston Mobile Notary Pros carries Errors & Omissions (E&O)
          insurance coverage. {/* TODO: Update E&O level mentioned here. */}\n E&O insurance helps protect consumers against financial loss due
          to unintentional notary errors or omissions during the notarization process.
        </p>
        <p className="mt-2">
          Our commitment to professionalism includes ensuring we meet all state requirements and maintain appropriate
          insurance coverage.
        </p>
      </div>
    ),
    category: "legal",
    keywords: ["insured", "bonded", "insurance", "bond", "e&o", "errors and omissions", "protection", "$10000", "$10k"],
    relatedQuestions: ["loan-signing"], // Add reference to LSA E&O if updated there
  },
] // End of faqs array

export default function FAQClientPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>(faqs)
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})
  const resultsRef = useRef<HTMLDivElement>(null)

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

  // Scroll to results when search is performed
  useEffect(() => {
    if (searchQuery && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [searchQuery])

  // Handle feedback
  const handleFeedback = (faqId: string, helpful: boolean) => {
    setFeedbackGiven((prev) => ({ ...prev, [faqId]: true }))
    // In a real implementation, this would send feedback to the server
    console.log(`Feedback for ${faqId}: ${helpful ? "Helpful" : "Not helpful"}`)
  }

  // Get popular FAQs
  const popularFAQs = faqs.filter((faq) => faq.popular)

  return (
    <>
      <FAQSchema />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find comprehensive answers to common questions about our mobile notary services. If you don't see your
            question here, please contact us directly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 bg-[#002147]/5 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-4 text-center">How can we help you?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-12 py-6 text-lg rounded-full border-gray-300 focus:border-[#002147] focus:ring-[#002147]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <p className="text-sm text-gray-500 mr-2 mt-1">Popular searches:</p>
            {["pricing", "identification", "documents", "scheduling", "mobile notary"].map((term) => (
              <Badge
                key={term}
                className="bg-[#91A3B0]/20 hover:bg-[#91A3B0]/30 text-[#002147] cursor-pointer"
                onClick={() => setSearchQuery(term)}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Links to Popular Questions */}
        {!searchQuery && activeCategory === "all" && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">Popular Questions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularFAQs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[#002147]">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="link"
                      className="text-[#A52A2A] p-0 h-auto font-normal"
                      onClick={() => {
                        setActiveCategory(faq.category)
                        setExpandedFAQ(faq.id)
                        setTimeout(() => {
                          document.getElementById(faq.id)?.scrollIntoView({ behavior: "smooth" })
                        }, 100)
                      }}
                    >
                      View answer <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Content */}
        <div className="grid md:grid-cols-4 gap-8" ref={resultsRef}>
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
              <h2 className="text-xl font-bold text-[#002147] mb-4">Categories</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      activeCategory === "all" ? "bg-[#002147] text-white" : "hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveCategory("all")
                      setExpandedFAQ(null)
                    }}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>All Categories</span>
                    <span className="text-sm ml-auto">{faqCounts.all}</span>
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                        activeCategory === category.id ? "bg-[#002147] text-white" : "hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => {
                        setActiveCategory(category.id)
                        setExpandedFAQ(null)
                      }}
                    >
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                      <span className="text-sm ml-auto">{faqCounts[category.id]}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Contact Info in Sidebar */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[#002147] mb-3">Need more help?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-[#A52A2A] mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Call us</p>
                      <p className="text-sm">(281) 779-8847</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-[#A52A2A] mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Email us</p>
                      <p className="text-sm">contact@houstonmobilenotarypros.com</p>
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button className="w-full mt-2 bg-[#A52A2A] hover:bg-[#8B0000]">Contact Us</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="md:col-span-3">
            {searchQuery && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-[#002147] font-medium">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? "result" : "results"} found for "{searchQuery}"
                </p>
                {filteredFAQs.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">Click on a question below to view the answer.</p>
                )}
              </div>
            )}

            {filteredFAQs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any FAQs matching your search. Please try different keywords or browse by category.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                  <Link href="/contact">
                    <Button className="bg-[#002147] hover:bg-[#001a38]">Ask Us Directly</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Category Title for filtered results */}
                {activeCategory !== "all" && !searchQuery && (
                  <h2 className="text-2xl font-bold text-[#002147] mb-6">
                    {categories.find((c) => c.id === activeCategory)?.name}
                  </h2>
                )}

                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                  value={expandedFAQ || undefined}
                  onValueChange={setExpandedFAQ}
                >
                  {filteredFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      id={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-semibold text-[#002147]">
                        {faq.question}
                        {faq.popular && <Badge className="ml-2 bg-[#A52A2A]">Popular</Badge>}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 bg-gray-50">
                        <div className="prose max-w-none">{faq.answer}</div>

                        {/* Related Questions */}
                        {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-[#002147] mb-2">Related Questions</h4>
                            <ul className="space-y-2">
                              {faq.relatedQuestions.map((relatedId) => {
                                const relatedFaq = faqs.find((f) => f.id === relatedId)
                                return relatedFaq ? (
                                  <li key={relatedId}>
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto text-[#A52A2A] font-normal"
                                      onClick={() => {
                                        setExpandedFAQ(relatedId)
                                        setTimeout(() => {
                                          document.getElementById(relatedId)?.scrollIntoView({ behavior: "smooth" })
                                        }, 100)
                                      }}
                                    >
                                      {relatedFaq.question}
                                    </Button>
                                  </li>
                                ) : null
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Feedback Buttons */}
                        {!feedbackGiven[faq.id] ? (
                          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center">
                            <span className="text-sm text-gray-600 mr-4">Was this answer helpful?</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleFeedback(faq.id, true)}
                            >
                              Yes
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleFeedback(faq.id, false)}>
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-green-600">Thank you for your feedback!</p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
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
                <Link href="/contact">
                  <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                    Contact Us
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#002147]"
                  as="a"
                  href="tel:+18326174285"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  (832) 617-4285
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

        {/* Table of Contents - Jump to Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setActiveCategory(category.id)
                  setExpandedFAQ(null)
                  window.scrollTo({ top: resultsRef.current?.offsetTop || 0, behavior: "smooth" })
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="bg-[#002147]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    {category.icon}
                  </div>
                  <p className="font-medium text-[#002147]">{category.name}</p>
                  <p className="text-sm text-gray-500">{faqCounts[category.id]} questions</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
