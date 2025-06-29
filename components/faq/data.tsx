import { HelpCircle, Clock, Filter, ChevronRight, FileText, Shield } from "lucide-react";
import type { FAQ, FAQCategory } from "./types";

// FAQ categories
export const categories: FAQCategory[] = [
  { id: "general", name: "General Questions", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "services", name: "Our Services", icon: <Clock className="h-4 w-4" /> },
  { id: "documents", name: "Document Requirements", icon: <FileText className="h-4 w-4" /> },
  { id: "pricing", name: "Pricing & Payment", icon: <ChevronRight className="h-4 w-4" /> },
  { id: "scheduling", name: "Scheduling & Availability", icon: <Clock className="h-4 w-4" /> },
  { id: "legal", name: "Legal & Compliance", icon: <Shield className="h-4 w-4" /> },
];

// Sample FAQ data - in a real implementation, this would come from a CMS or database
export const faqs: FAQ[] = [
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
          <li>You need notarization outside normal business hours</li>
          <li>You have multiple signers at different locations</li>
          <li>You're in a hospital, nursing home, or other restricted location</li>
          <li>You have a busy schedule and can't visit a notary office</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Pro Tip:</strong> Mobile notaries are especially valuable for real estate transactions and loan signings.
          </p>
        </div>
      </div>
    ),
    category: "general",
    keywords: ["mobile", "convenience", "location", "travel", "service", "time-saving", "accessibility"],
    relatedQuestions: ["service-area", "response-time"],
    popular: true,
  },
  {
    id: "service-area",
    question: "What areas do you serve?",
    answer: (
      <div>
        <p>
          Our primary service area covers the greater Houston metropolitan area, with our base in Texas City (ZIP 77591).
          We provide standard service within a 20-mile radius.
        </p>
        <p className="mt-2">Areas we serve include:</p>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Houston</li>
            <li>Galveston</li>
            <li>League City</li>
            <li>Pearland</li>
            <li>Sugar Land</li>
          </ul>
          <ul className="list-disc list-inside space-y-1">
            <li>Texas City</li>
            <li>Friendswood</li>
            <li>Clear Lake</li>
            <li>Pasadena</li>
            <li>Baytown</li>
          </ul>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Outside our standard area? Contact us for availability and travel fees.
        </p>
      </div>
    ),
    category: "general",
    keywords: ["service area", "houston", "texas city", "galveston", "location", "travel", "coverage"],
    relatedQuestions: ["travel-fees", "response-time"],
    popular: true,
  },

  // Services
  {
    id: "loan-signing",
    question: "What is a loan signing specialist?",
    answer: (
      <div>
        <p>
          A loan signing specialist is a specially trained notary who specializes in real estate loan document signings.
          They guide borrowers through mortgage, refinance, and HELOC document packages.
        </p>
        <p className="mt-2">Our loan signing specialists:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Are certified and background-checked</li>
          <li>Understand complex loan documents</li>
          <li>Ensure proper completion and notarization</li>
          <li>Work with title companies and lenders</li>
          <li>Provide professional, punctual service</li>
        </ul>
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Important:</strong> We facilitate signings but don't provide legal advice about loan terms.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["loan signing", "specialist", "mortgage", "refinance", "HELOC", "real estate", "documents"],
    relatedQuestions: ["pricing-loan-signing", "loan-documents"],
    popular: true,
  },
  {
    id: "ron-service",
    question: "Do you offer Remote Online Notarization (RON)?",
    answer: (
      <div>
        <p>
          Yes! We offer Remote Online Notarization (RON) services, allowing you to get documents notarized from
          anywhere with an internet connection.
        </p>
        <p className="mt-2">RON is perfect for:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Out-of-state signers</li>
          <li>Urgent documents when travel isn't possible</li>
          <li>International clients</li>
          <li>Mobility-restricted individuals</li>
          <li>Busy professionals</li>
        </ul>
        <p className="mt-2">
          Our RON platform is secure, state-approved, and creates a permanent digital record of the notarization.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Requirements:</strong> Valid government ID, reliable internet, camera, and microphone.
          </p>
        </div>
      </div>
    ),
    category: "services",
    keywords: ["RON", "remote", "online", "notarization", "digital", "virtual", "internet"],
    relatedQuestions: ["ron-requirements", "ron-pricing"],
    popular: true,
  },

  // Documents
  {
    id: "required-documents",
    question: "What documents do I need to bring?",
    answer: (
      <div>
        <p>For any notarization, you'll need:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Valid Government-Issued Photo ID</strong> (driver's license, passport, state ID)</li>
          <li><strong>The document(s) to be notarized</strong> (unsigned - you'll sign in front of the notary)</li>
        </ul>
        <p className="mt-4">Acceptable forms of ID include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Current driver's license</li>
          <li>Current state-issued ID card</li>
          <li>Current U.S. passport</li>
          <li>Current military ID</li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> ID must be current and not expired. Photocopies are not acceptable.
          </p>
        </div>
      </div>
    ),
    category: "documents",
    keywords: ["required", "documents", "ID", "identification", "driver's license", "passport", "state ID"],
    relatedQuestions: ["expired-id", "foreign-id"],
    popular: true,
  },

  // Pricing
  {
    id: "pricing-standard",
    question: "How much does notarization cost?",
    answer: (
      <div>
        <p>Our pricing is transparent and competitive:</p>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Standard Mobile Notary</span>
            <span className="font-semibold">$75</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Loan Signing Specialist</span>
            <span className="font-semibold">$150</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Emergency/After Hours</span>
            <span className="font-semibold">$125</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Remote Online Notarization</span>
            <span className="font-semibold">$50</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Pricing includes travel within our standard 20-mile service area. Additional travel fees may apply for longer distances.
        </p>
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Good to know:</strong> We accept cash, check, Venmo, Zelle, and credit cards.
          </p>
        </div>
      </div>
    ),
    category: "pricing",
    keywords: ["pricing", "cost", "fees", "rates", "payment", "standard", "loan signing", "emergency", "RON"],
    relatedQuestions: ["payment-methods", "travel-fees", "discounts"],
    popular: true,
  },

  // Scheduling
  {
    id: "response-time",
    question: "How quickly can you respond?",
    answer: (
      <div>
        <p>Our response times vary based on service type and availability:</p>
        <div className="mt-2 space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold">Standard Service</h4>
            <p className="text-sm text-gray-600">Usually same-day or next-day scheduling</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-semibold">Emergency Service</h4>
            <p className="text-sm text-gray-600">Within 2-4 hours (subject to availability)</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold">Remote Online Notarization</h4>
            <p className="text-sm text-gray-600">Often available within 1-2 hours</p>
          </div>
        </div>
        <p className="mt-4">
          We recommend booking in advance when possible, especially for loan signings or during busy periods.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Call us directly at (281) 991-7475 for urgent requests.
          </p>
        </div>
      </div>
    ),
    category: "scheduling",
    keywords: ["response time", "scheduling", "same day", "emergency", "urgent", "availability", "booking"],
    relatedQuestions: ["emergency-service", "booking-process"],
    popular: true,
  },

  // Legal
  {
    id: "legal-advice",
    question: "Can you provide legal advice about my documents?",
    answer: (
      <div>
        <p>
          <strong>No, we cannot provide legal advice.</strong> As notaries, we are not attorneys and are prohibited
          by law from giving legal advice or interpreting the contents of documents.
        </p>
        <p className="mt-2">What we can do:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Verify your identity</li>
          <li>Witness your signature</li>
          <li>Ensure you're signing willingly</li>
          <li>Complete the notarial certificate</li>
          <li>Explain the notarization process</li>
        </ul>
        <p className="mt-2">What we cannot do:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Explain what documents mean</li>
          <li>Advise which documents you need</li>
          <li>Recommend how to fill out forms</li>
          <li>Make legal recommendations</li>
        </ul>
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Important:</strong> Please consult with an attorney for legal questions about your documents.
          </p>
        </div>
      </div>
    ),
    category: "legal",
    keywords: ["legal advice", "attorney", "interpretation", "documents", "unauthorized practice", "law"],
    relatedQuestions: ["what-notary-does", "document-preparation"],
    popular: true,
  }
];

// Helper function to get FAQs by category
export function getFAQsByCategory(categoryId: string): FAQ[] {
  return faqs.filter(faq => faq.category === categoryId);
}

// Helper function to get popular FAQs
export function getPopularFAQs(): FAQ[] {
  return faqs.filter(faq => faq.popular === true);
}

// Helper function to search FAQs
export function searchFAQs(searchTerm: string): FAQ[] {
  const term = searchTerm.toLowerCase();
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(term) ||
    faq.keywords.some(keyword => keyword.toLowerCase().includes(term))
  );
}