import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Houston Mobile Notary Pros",
  description:
    "Our terms of service outline the conditions for using our mobile notary services, including scheduling, cancellations, and legal limitations.",
  keywords: "terms of service, legal terms, notary terms, service conditions, cancellation policy",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#002147] mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <p>
            These Terms of Service ("Terms") govern your use of the mobile notary services provided by Houston Mobile
            Notary Pros ("we," "us," or "our"). By using our services, you agree to these Terms. Please read them
            carefully.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">1. Service Description</h2>
          <p>
            Houston Mobile Notary Pros provides mobile notary services throughout the Houston metropolitan area. Our
            notaries travel to your location to perform notarial acts, including acknowledgments, jurats, oaths and
            affirmations, and other notarial services authorized by Texas law.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">2. Legal Limitations of Notary Services</h2>
          <p>
            In accordance with Texas Government Code §406.017, our notaries are not attorneys licensed to practice law
            in Texas and may not give legal advice or accept fees for legal advice. Specifically, our notaries cannot:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide legal advice or explain the contents or effects of documents</li>
            <li>Prepare legal documents or fill in forms beyond adding notarial wording</li>
            <li>Advise which type of notarization is needed for your document</li>
            <li>Represent you in legal proceedings</li>
            <li>Recommend whether you should or should not sign a document</li>
            <li>Explain the legal implications of your documents</li>
          </ul>
          <p>
            Our role is strictly limited to verifying identity, witnessing signatures, and performing notarial acts as
            authorized by Texas law.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">3. Appointment Scheduling</h2>
          <p>
            Appointments can be scheduled through our website, by phone, or by email. By scheduling an appointment, you
            agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information about your location, contact details, and service needs</li>
            <li>
              Ensure all signers will be present with valid, government-issued photo identification at the scheduled
              time
            </li>
            <li>Have all documents prepared and ready for notarization (but not pre-signed)</li>
            <li>Be available at the agreed-upon location for the duration of the appointment</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">4. Cancellation and Rescheduling Policy</h2>
          <p>Our cancellation policy is as follows:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>24+ Hours Notice:</strong> Full refund of any deposits or prepayments. No cancellation fee
              applies.
            </li>
            <li>
              <strong>2-24 Hours Notice:</strong> No cancellation fee, but any deposits may be converted to a credit for
              future service rather than refunded.
            </li>
            <li>
              <strong>Less than 2 Hours Notice:</strong> $35 cancellation fee may apply to cover administrative costs
              and the notary's preparation time.
            </li>
            <li>
              <strong>No-Show:</strong> $50 fee plus travel costs may apply if our notary arrives at the appointment
              location and no one is available within 15 minutes of the scheduled time.
            </li>
          </ul>
          <p>
            Rescheduling with at least 2 hours' notice is free of charge. For rescheduling with less than 2 hours'
            notice, a $15 fee may apply.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">5. Fees and Payment</h2>
          <p>
            Our fees vary based on the service package selected, number of signers, document complexity, time of
            service, and travel distance. Current pricing is available on our website or by contacting us directly.
          </p>
          <p>Payment terms include:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Payment is due at the time of service unless other arrangements have been made in advance</li>
            <li>
              We accept credit/debit cards (Visa, MasterCard, American Express, Discover), cash (exact change required),
              and offer corporate billing for approved business accounts
            </li>
            <li>Additional fees may apply for weekend service, after-hours service, or extended travel</li>
            <li>
              For business accounts with approved credit, we offer monthly billing options with payment due within 30
              days of invoice
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">6. Service Area and Travel Fees</h2>
          <p>
            Our standard service area extends to a 20-mile radius from ZIP code 77591. For locations beyond this radius,
            a travel fee of $0.50 per mile applies to the distance beyond the standard service area.
          </p>
          <p>
            For Priority Service, the extended service area is increased to 35 miles, with the same $0.50/mile fee
            applying beyond that distance.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">7. Refusal of Service</h2>
          <p>We reserve the right to refuse service in the following situations:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>When the signer does not have valid, acceptable identification</li>
            <li>When the document contains blank spaces that should be filled in</li>
            <li>When the signer appears to be under duress or lacks capacity</li>
            <li>When the notary has a direct financial or beneficial interest in the transaction</li>
            <li>When the signer cannot be properly identified</li>
            <li>When providing the service would violate any law or ethical obligation</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Houston Mobile Notary Pros shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
            incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting
            from:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your use of or inability to use our services</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li>
              Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any
              content posted, emailed, transmitted, or otherwise made available through our services
            </li>
          </ul>
          <p>
            Our total liability for any claims under these Terms shall not exceed the amount you paid us for the service
            giving rise to the claim.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Houston Mobile Notary Pros, its officers, directors,
            employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities,
            costs, or debt, and expenses (including but not limited to attorney's fees) arising from your use of and
            access to our services, your violation of any term of these Terms, or your violation of any third-party
            right, including without limitation any copyright, property, or privacy right.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of Texas without regard to its conflict of law
            provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within
            Harris County, Texas.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
            provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change
            will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our services after any revisions become effective, you agree to be bound by
            the revised terms. If you do not agree to the new terms, you are no longer authorized to use our services.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">12. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p className="mb-1">Houston Mobile Notary Pros</p>
          <p className="mb-1">Phone: (281) 779-8847</p>
          <p className="mb-1">Email: contact@houstonmobilenotarypros.com</p>
        </div>
      </div>
    </div>
  )
}
