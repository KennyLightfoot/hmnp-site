import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Houston Mobile Notary Pros",
  description: "Learn about how Houston Mobile Notary Pros handles your personal information.",
  keywords: "notary privacy policy, Houston notary privacy, data protection notary service, mobile notary privacy policy, HMNP privacy",
  robots: { // Allow indexing now that content is added
    index: true, 
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdatedDate = "May 13, 2025"; // Update this date whenever the policy changes

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-[#002147] mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: {lastUpdatedDate}</p>

        <div className="prose max-w-none text-gray-800 space-y-4">
          <p>
            Houston Mobile Notary Pros ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (houstonmobilenotarypros.com), use our mobile notary services, or interact with us in any other way. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">1. Information We Collect</h2>
          <p>We may collect personal information about you in a variety of ways. The information we may collect includes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your full legal name, physical address of signing location, email address, and telephone number, that you voluntarily give to us when you request services or contact us.
            </li>
            <li>
              <strong>Document Information:</strong> Information related to the documents requiring notarization, such as document type and count, as needed to schedule and perform the service.
            </li>
            <li>
              <strong>Identification Information:</strong> Details from your valid government-issued identification (e.g., driver's license, passport) presented for identity verification as required by Texas law for notarial acts. This information is primarily used for verification at the time of service and recorded in the notary's official journal as legally required.
            </li>
            <li>
              <strong>Appointment Information:</strong> Preferred appointment dates and times, and service type requested (e.g., Essential, Priority, Loan Signing).
            </li>
            <li>
              <strong>Payment Data:</strong> Data necessary to process your payments if you make purchases, such as your payment instrument number (e.g., credit card) and the security code associated with your payment instrument. All payment data is stored securely by our payment processor. We may place a temporary authorization hold as described in our Terms & Conditions.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site. 
            </li>
            {/* Add Mobile Device Data if applicable */}
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Schedule and confirm notary service appointments.</li>
            <li>Perform the requested notarial services, including verifying signer identity as required by law.</li>
            <li>Process payments, deposits, and refunds.</li>
            <li>Communicate with you regarding your appointment or inquiries.</li>
            <li>Maintain our legally required notary journal records.</li>
            <li>Improve the efficiency and operation of the Site and our services.</li>
            {/* Add marketing opt-in if applicable */}
            <li>Resolve disputes and troubleshoot problems.</li>
            <li>Comply with legal and regulatory requirements.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">3. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation. This includes exchanging information with other entities for fraud protection.
            </li>
            <li>
              <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and potentially marketing assistance. 
            </li>
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. This includes secure record-keeping in our notary journal, secure cloud storage for necessary digital records, and using reputable payment processors. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">5. Data Retention</h2>
          <p>
            We will retain your personal information collected for our notary journal for a minimum of seven (7) years, as required by Texas law or best practices. Other personal information will be retained only for as long as necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law. Secure deletion protocols are followed for information beyond its required retention period.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">6. SMS Consent</h2>
          <p>
            We only send SMS messages where you have explicitly opted in. We log the timestamp, source, IP address, and user agent of your consent. You can opt out at any time by replying STOP. Reply HELP for assistance. Msg & data rates may apply.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">7. Policy for Children</h2>
          <p>
            We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">8. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or request deletion of your personal data. Please contact us to inquire about or exercise these rights. Note that certain information, such as notary journal entries, must be retained as required by law.
          </p>

          {/* Optional Cookie Section - include if using cookies */}
          {/* 
          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">8. Website Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Site.
          </p>
          */}

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">9. Changes to This Privacy Policy</h2> { /* Adjust heading number if cookie section is included */} 
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold text-[#002147] mt-6 mb-2">10. Contact Us</h2> { /* Adjust heading number if cookie section is included */} 
          <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
          <p>
            <strong>Houston Mobile Notary Pros</strong><br />
            Phone: (832) 617-4285<br />
            Email: contact@houstonmobilenotarypros.com
            {/* Add physical address if applicable */}
          </p>
        </div>
      </div>
    </div>
  )
}