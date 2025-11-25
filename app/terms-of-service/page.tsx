import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms and Conditions | Houston Mobile Notary Pros",
  description: "Review the terms and conditions for using Houston Mobile Notary Pros services.",
  keywords: "notary terms and conditions, mobile notary terms, Houston notary terms, HMNP terms and conditions, service terms Houston mobile notary",
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  const lastUpdatedDate = "May 13, 2025" // Update this date whenever terms change

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-[#002147] mb-4">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: {lastUpdatedDate}</p>

        <div className="prose max-w-none text-gray-800 space-y-4">
          <p>
            Welcome to Houston Mobile Notary Pros! These Terms and Conditions ("Terms") govern your use of our website (houstonmobilenotarypros.com) and
            the mobile notary and related services ("Services") provided by Houston Mobile Notary Pros ("we," "us," or "our").
          </p>
          <p>
            Please read these Terms carefully. By accessing our website or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms,
            you may not use our website or Services.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">1. Services Offered</h2>
          <p>We provide professional mobile notary public services within our defined service area in Texas. Services include, but are not limited to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Notarization of documents (Acknowledgments, Jurats, Oaths, etc.)</li>
            <li>Loan Signing Agent services</li>
            <li>Specialty notary services as listed on our website.</li>
          </ul>
          <p>
            Our role is strictly limited to acting as an impartial witness in performing notarial acts as prescribed by Texas law. We are not attorneys and do not provide legal advice.
            We cannot explain the contents of documents or the legal implications of signing them. For Loan Signings, we are prohibited from explaining loan terms.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">2. Legal Disclaimer and Limitations</h2>
          <div className="bg-red-50 border-l-4 border-red-600 p-6 my-4 rounded">
            <p className="font-bold text-red-900 text-lg mb-3">REQUIRED STATUTORY DISCLAIMER (Texas Government Code §406.017)</p>
            <p className="text-red-800 font-semibold italic text-base mb-4">
              "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE."
            </p>
          </div>

          <p className="font-semibold text-[#002147] mb-2">We Are Not Attorneys</p>
          <p>
            Houston Mobile Notary Pros and our notaries public are <strong>NOT attorneys</strong> licensed to practice law in Texas. We are prohibited by law from
            providing legal advice, legal opinions, or legal services of any kind. We cannot and will not act as your legal representative or advocate.
          </p>

          <p className="font-semibold text-[#002147] mt-4 mb-2">What We CANNOT Do</p>
          <p>The following activities are strictly prohibited and we will not engage in them:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Provide Legal Advice:</strong> We cannot explain what your documents mean, interpret legal language, or advise you on the legal implications of signing documents.
            </li>
            <li>
              <strong>Explain Document Contents:</strong> We cannot explain the contents, terms, conditions, or effects of any document you are signing.
            </li>
            <li>
              <strong>Recommend Actions:</strong> We cannot recommend whether you should or should not sign a document, or advise you on what documents you need.
            </li>
            <li>
              <strong>Prepare Legal Documents:</strong> We cannot prepare, draft, or fill in legal documents beyond adding notarial wording (certificates) as required by law.
            </li>
            <li>
              <strong>Select Notarization Type:</strong> We cannot advise which type of notarization (acknowledgment, jurat, etc.) is needed for your document.
            </li>
            <li>
              <strong>Explain Loan Terms:</strong> For loan signings, we are specifically prohibited from explaining loan terms, interest rates, payment schedules, or any other loan-related information.
            </li>
            <li>
              <strong>Provide Financial Advice:</strong> We cannot provide financial advice, investment advice, or tax advice.</li>
            <li>
              <strong>Represent You Legally:</strong> We cannot represent you in legal proceedings, negotiations, or disputes.</li>
            <li>
              <strong>Act as an Advocate:</strong> We must remain impartial and cannot act as an advocate for any party in a transaction.</li>
            <li>
              <strong>Accept Fees for Legal Services:</strong> We cannot accept any fees for legal advice or legal services, as this would constitute the unauthorized practice of law.</li>
          </ul>

          <p className="font-semibold text-[#002147] mt-4 mb-2">What We CAN Do</p>
          <p>Our role is strictly limited to performing notarial acts as authorized by Texas law:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Verify Identity:</strong> We can verify your identity using acceptable forms of identification.</li>
            <li><strong>Witness Signatures:</strong> We can witness you signing documents in our presence.</li>
            <li><strong>Administer Oaths:</strong> We can administer oaths and affirmations as required by law.</li>
            <li><strong>Complete Notarial Certificates:</strong> We can complete and attach notarial certificates to your documents.</li>
            <li><strong>Maintain Notary Journal:</strong> We can record notarial acts in our official notary journal.</li>
            <li><strong>Explain Notarization Process:</strong> We can explain the notarization process itself, notary requirements, and logistics of our services.</li>
            <li><strong>Ensure Willingness:</strong> We can verify that you are signing willingly and without coercion.</li>
            <li><strong>Refuse Service:</strong> We can refuse to notarize if required by law or if we suspect fraud, coercion, or other illegal activity.</li>
          </ul>

          <p className="font-semibold text-[#002147] mt-4 mb-2">Consult an Attorney</p>
          <p>
            If you have questions about the meaning of your documents, legal implications, or what type of notarization is required, <strong>you must consult with a licensed attorney.</strong>
            We cannot provide that guidance. If you need a referral to an attorney, we can provide contact information for local bar associations or legal referral services.
          </p>

          <p className="font-semibold text-[#002147] mt-4 mb-2">Unauthorized Practice of Law</p>
          <p>
            Providing legal advice or legal services without a license constitutes the unauthorized practice of law, which is a criminal offense in Texas. We strictly adhere to our role as notaries public.
          </p>

          <p className="font-semibold text-[#002147] mt-4 mb-2">No Attorney-Client Relationship</p>
          <p>By using our services, you acknowledge and agree that no attorney-client relationship is created between you and Houston Mobile Notary Pros.</p>

          <p className="font-semibold text-[#002147] mt-4 mb-2">Your Responsibility</p>
          <p>You are solely responsible for understanding your documents, consulting an attorney if needed, ensuring documents are complete, knowing the notarization type required, and making informed signing decisions.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">3. Service Area</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Primary Service Area:</strong> 20-mile radius from ZIP code 77591.</li>
            <li><strong>Extended Service Area:</strong> 20-50 miles from ZIP code 77591 with tiered travel fees.</li>
            <li>We reserve the right to decline service outside our defined service areas.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">4. Service Hours</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Essential Services:</strong> Generally available 9:00 AM - 5:00 PM, Monday - Friday.</li>
            <li><strong>Priority Services:</strong> Generally available 7:00 AM - 9:00 PM, daily.</li>
            <li><strong>Weekend Services:</strong> Essential Services may be available Saturday/Sunday with a surcharge.</li>
            <li><strong>After-Hours:</strong> May require notice and surcharge, subject to availability.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2" id="fees-and-payment">5. Fees and Payment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Notarial Act Fees:</strong> Charged per notarization as permitted by Texas law.</li>
            <li><strong>Service Fees:</strong> Mobile service, travel, after-hours, and admin fees are billed separately.</li>
            <li><strong>Travel Fees:</strong> Apply per our posted tiers.</li>
            <li><strong>Deposit:</strong> $25 deposit required at booking.</li>
            <li><strong>Payment Authorization:</strong> Valid credit card required at booking.</li>
            <li><strong>Payment Due:</strong> Remaining balance due at time of service.</li>
            <li><strong>Corporate Accounts:</strong> May be eligible for Net-15 billing.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">6. Cancellation and No-Show Policy</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Cancellation Notice:</strong> Provide at least four (4) hours notice.</li>
            <li><strong>Late Cancellation / No-Show Fee:</strong> $50 fee applies for late cancels or no-shows.</li>
            <li><strong>Fee Application:</strong> Fee deducted from deposit; remaining charged to card on file.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">7. Signer Requirements</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Presence:</strong> All signers must be present.</li>
            <li><strong>Identification:</strong> Valid, unexpired government-issued photo ID required.</li>
            <li><strong>Document Preparation:</strong> Documents must be complete but unsigned before the appointment.</li>
            <li><strong>Understanding and Willingness:</strong> Signers must show willingness and comprehension.</li>
            <li><strong>Witnesses:</strong> Provide your own witnesses if needed.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">8. Refusal of Service</h2>
          <p>We reserve the right to refuse service if identification is invalid, signer unwilling, fraud is suspected, or any other legal requirement is not met.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">9. Limitation of Liability</h2>
          <p>
            Our liability is limited to the fees paid for the specific Service rendered. We maintain Errors & Omissions (E&O) insurance with a coverage limit of $100,000 per claim.
            We are not liable for indirect, incidental, special, consequential, or punitive damages.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">10. Confidentiality</h2>
          <p>
            We adhere to strict confidentiality standards regarding your documents and personal information, except as required by law. Please see our{" "}
            <Link href="/privacy-policy" className="text-[#A52A2A] hover:underline">
              Privacy Policy
            </Link>{" "}
            for details on how we handle your data.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">11. Website Use</h2>
          <p>The content on our website is for informational purposes only. Your use of the website is at your own risk.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">12. SMS Messaging Terms</h2>
          <p>By opting in, you consent to receive SMS messages related to your inquiries and bookings. Message frequency varies. Reply STOP to opt out.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">13. Intellectual Property</h2>
          <p>All site content is the property of Houston Mobile Notary Pros or its suppliers and protected by law.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">14. Governing Law and Dispute Resolution</h2>
          <p>These Terms are governed by the laws of the State of Texas. Disputes will be resolved through negotiation, mediation, or arbitration in Harris County, Texas.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">15. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Continued use of the website or Services after changes constitutes acceptance.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">16. Contact Information</h2>
          <p>
            <strong>Houston Mobile Notary Pros</strong>
            <br />
            Phone: (832) 617-4285
            <br />
            Email: contact@houstonmobilenotarypros.com
          </p>

          <hr className="my-6" />

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">Appendix: Federal Holidays Observed</h2>
          <p>(Closed for Service - No appointments scheduled)</p>
          <ul className="list-disc pl-6 space-y-1 columns-2">
            <li>New Year's Day</li>
            <li>Martin Luther King Jr. Day</li>
            <li>Presidents' Day</li>
            <li>Memorial Day</li>
            <li>Juneteenth</li>
            <li>Independence Day</li>
            <li>Labor Day</li>
            <li>Columbus Day</li>
            <li>Veterans Day</li>
            <li>Thanksgiving Day</li>
            <li>Christmas Day</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

