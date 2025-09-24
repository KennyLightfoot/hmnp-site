import { Metadata } from "next"
import Link from "next/link"; // Import Link

export const metadata: Metadata = {
  title: "Terms and Conditions | Houston Mobile Notary Pros",
  description: "Review the terms and conditions for using Houston Mobile Notary Pros services.",
  keywords: "notary terms and conditions, mobile notary terms, Houston notary terms, HMNP terms and conditions, service terms Houston mobile notary",
  robots: { // Allow indexing now that content is added
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  const lastUpdatedDate = "May 13, 2025"; // Update this date whenever terms change

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-[#002147] mb-4">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: {lastUpdatedDate}</p>

        <div className="prose max-w-none text-gray-800 space-y-4">
          <p>
            Welcome to Houston Mobile Notary Pros! These Terms and Conditions ("Terms") govern your use of our website (houstonmobilenotarypros.com) and the mobile notary and related services ("Services") provided by Houston Mobile Notary Pros ("we," "us," or "our").
          </p>
          <p>
            Please read these Terms carefully. By accessing our website or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our website or Services.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">1. Services Offered</h2>
          <p>We provide professional mobile notary public services within our defined service area in Texas. Services include, but are not limited to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Notarization of documents (Acknowledgments, Jurats, Oaths, etc.)</li>
            <li>Loan Signing Agent services</li>
            <li>Specialty notary services as listed on our website.</li>
          </ul>
          <p>
            Our role is strictly limited to acting as an impartial witness in performing notarial acts as prescribed by Texas law. We are not attorneys and do not provide legal advice. We cannot explain the contents of documents or the legal implications of signing them. For Loan Signings, we are prohibited from explaining loan terms.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">2. Service Area</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Primary Service Area:</strong> 20-mile radius from ZIP code 77591.</li>
            <li><strong>Extended Service Area:</strong> 20-50 miles from ZIP code 77591. Tiered travel applies beyond the included 20 miles: 21–30 +$25; 31–40 +$45; 41–50 +$65.</li>
            <li>We reserve the right to decline service outside our defined service areas or adjust fees based on travel time and distance. Service availability is subject to notary availability.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">3. Service Hours</h2>
           <ul className="list-disc pl-6 space-y-1">
            <li><strong>Essential Services:</strong> Generally available 9:00 AM - 5:00 PM, Monday - Friday.</li>
            <li><strong>Priority Services:</strong> Generally available 7:00 AM - 9:00 PM, Daily.</li>
            <li><strong>Weekend Services:</strong> Essential Services may be available Saturday/Sunday with a +$40 surcharge and require 24-hour advance booking.</li>
            <li><strong>After-Hours (7 PM - 9 PM):</strong> May require 24-hour notice and a $30 surcharge, subject to availability.</li>
            <li>Availability is subject to change and notary schedules. We are closed on Federal Holidays listed in the Appendix.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">4. Booking and Appointments</h2>
           <ul className="list-disc pl-6 space-y-1">
            <li>Appointments can be requested via our website booking system or by contacting us directly.</li>
            <li>To secure an appointment, you must provide: full legal name(s) of signer(s), document type(s)/count, service type, physical signing location address, and preferred appointment window.</li>
            <li><strong>Same-Day Standard Notary Service:</strong> Requests must be made by 3:00 PM for a potential 5:00 PM appointment, subject to availability. Requires a credit card guarantee.</li>
            <li><strong>Extended Hours Notary:</strong> Confirmation requires an available 2-hour window.</li>
          </ul>

          <h2 id="fees-and-payment" className="text-2xl font-semibold text-[#002147] mt-6 mb-2">5. Fees and Payment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Notarial Act Fees:</strong> Fees for specific notarial acts (e.g., Acknowledgments, Jurats) are charged per notarization/signature as permitted by Texas Government Code §406.024. Our current fees are listed on our website and/or provided during booking.</li>
            <li><strong>Service Fees:</strong> Mobile service, travel, administrative, after-hours, weekend, and other non-notarial fees are charged separately from notarial act fees, as permitted by §406.024(c). These will be itemized in your quote and invoice.</li>
            <li><strong>Travel Fees:</strong> Apply for travel within the Extended Service Area as described in Section 2.</li>
            <li><strong>Deposit:</strong> A flat deposit of $25.00 is required at the time of booking for <strong>all</strong> appointments to secure your requested time slot. This deposit will be applied towards your final invoice amount upon successful completion of the service.</li>
            <li><strong>Payment Authorization:</strong> A valid credit card is required at the time of booking to process the deposit and must be kept on file. This card may be charged for the remaining balance upon service completion or for any applicable cancellation fees (see Section 6).</li>
            <li><strong>Payment Due:</strong> The remaining balance (total fees minus deposit paid) is due at the time service is rendered.</li>
            <li><strong>Payment Methods:</strong> We accept major credit cards for deposits and final payments. Cash may be accepted for the final balance in specific circumstances (e.g., repeat clients with agreement, corporate accounts) and requires exact change.</li>
            <li><strong>Corporate Accounts:</strong> May be eligible for Net-15 billing subject to credit approval, potentially altering deposit requirements.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">6. Cancellation and No-Show Policy</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Cancellation Notice:</strong> Please provide at least <strong>four (4) hours</strong> notice prior to your scheduled appointment time if you need to cancel or reschedule. You can notify us via phone or email using the contact information provided.</li>
            <li><strong>Late Cancellation / No-Show Fee:</strong> If you cancel with less than four (4) hours notice, fail to appear for your appointment, or if the signing cannot proceed due to reasons within your control (e.g., lack of required valid ID, absence of signer, unprepared documents preventing notarization), a <strong>$50.00 cancellation/no-show fee</strong> will be charged.</li>
            <li><strong>Fee Application:</strong> This $50.00 fee will be deducted from the deposit paid. Your $25.00 deposit will be applied towards this fee, and the remaining $25.00 will be charged to the credit card on file. If the appointment is successfully completed after rescheduling, this fee does not apply to the rescheduled appointment (though a new deposit may be required for the new time).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">7. Signer Requirements</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Presence:</strong> All signers must be physically present at the agreed-upon time and location.</li>
            <li><strong>Identification:</strong> Each signer must present valid, unexpired, government-issued photo identification (e.g., Driver's License, State ID Card, US Passport) acceptable under Texas law. The name on the ID must reasonably match the name on the document.</li>
            <li><strong>Document Preparation:</strong> Documents should be complete but <strong>MUST NOT BE SIGNED OR DATED</strong> before the notary arrives, unless the document specifically requires pre-signing (which is rare for standard notarizations).</li>
            <li><strong>Understanding and Willingness:</strong> Signers must demonstrate to the notary that they understand the document they are signing and are doing so willingly, without coercion. The notary may refuse service if these conditions are not met.</li>
            <li><strong>Witnesses:</strong> If your document requires witnesses in addition to the notary, you must provide your own witnesses who meet state requirements (generally, they must be known to the signer, have valid ID, and have no financial interest in the transaction).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">8. Refusal of Service</h2>
          <p>We reserve the right to refuse service if:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The signer cannot provide valid identification.</li>
            <li>The signer appears confused, unwilling, or coerced.</li>
            <li>We suspect fraud or illegal activity.</li>
            <li>The requested act is prohibited by law or notary guidelines.</li>
            <li>The environment is unsafe or unprofessional.</li>
            <li>Payment (deposit or final) cannot be secured.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">9. Limitation of Liability</h2>
          <p>
            Our liability is limited to the fees paid for the specific Service rendered. We maintain Errors & Omissions (E&O) insurance with a coverage limit of $100,000 per claim, as relevant to notarial acts. We are not liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services. This limitation applies regardless of whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">10. Confidentiality</h2>
          <p>
            We adhere to strict confidentiality standards regarding your documents and personal information, except as required by law (e.g., notary journal entries, legal process). Please see our <Link href="/privacy" className="text-[#A52A2A] hover:underline">Privacy Policy</Link> for details on how we handle your data.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">11. Website Use</h2>
          <p>
            The content on our website is for informational purposes only. We strive for accuracy but do not guarantee that the information is complete or error-free. Your use of the website is at your own risk.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">12. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and images, is the property of Houston Mobile Notary Pros or its content suppliers and protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">13. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by the laws of the State of Texas, without regard to its conflict of law principles. Any dispute arising from these Terms or the Services shall ideally be resolved through good-faith negotiation first. If negotiation fails, disputes may be pursued through mediation or binding arbitration in Harris County, Texas, before resorting to litigation. [Consider consulting legal counsel on the best dispute resolution clause].
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">14. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will post the revised Terms on this page and update the "Last Updated" date. Your continued use of the website or Services after changes constitutes your acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">15. Contact Information</h2>
          <p>For any questions regarding these Terms, please contact us:</p>
          <p>
            <strong>Houston Mobile Notary Pros</strong><br />
            Phone: (832) 617-4285<br />
            Email: contact@houstonmobilenotarypros.com
          </p>

          <hr className="my-6"/>

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