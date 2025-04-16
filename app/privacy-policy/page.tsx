import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Houston Mobile Notary Pros",
  description:
    "Our privacy policy explains how we collect, use, and protect your personal information when you use our mobile notary services.",
  keywords: "privacy policy, data protection, notary privacy, information security, personal data",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#002147] mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="prose max-w-none">
          <p>
            Houston Mobile Notary Pros ("we," "us," or "our") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile notary
            services or visit our website.
          </p>

          <p>
            Please read this Privacy Policy carefully. By using our services or website, you consent to the data
            practices described in this policy.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Information We Collect</h2>

          <h3 className="text-xl font-semibold text-[#002147] mt-6 mb-3">Personal Information</h3>
          <p>We may collect personal information that you provide to us, including but not limited to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, address, email address, and phone number</li>
            <li>Government-issued identification information (required for notarization)</li>
            <li>Signatures and, in some cases, thumbprints (as required by Texas notary law)</li>
            <li>Information about the documents being notarized</li>
            <li>Payment information</li>
            <li>Any other information you provide when communicating with us</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#002147] mt-6 mb-3">Notary Journal Information</h3>
          <p>
            As required by Texas law, our notaries maintain journals of all notarial acts performed. These journals
            include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Date and time of the notarization</li>
            <li>Type of notarial act performed</li>
            <li>Document type</li>
            <li>Name and address of the signer(s)</li>
            <li>How the signer was identified</li>
            <li>Signature of the signer</li>
            <li>Thumbprint (for certain document types as required by law)</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#002147] mt-6 mb-3">Website Usage Data</h3>
          <p>When you visit our website, we may automatically collect certain information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on those pages</li>
            <li>Referring website addresses</li>
            <li>Device information</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Fulfill our legal obligations as notaries public</li>
            <li>Send appointment confirmations and updates</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Protect against, identify, and prevent fraud and other illegal activity</li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Information Sharing and Disclosure</h2>
          <p>We may share your personal information in the following situations:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if required to do so by law or in response
              to valid requests by public authorities (e.g., a court or government agency).
            </li>
            <li>
              <strong>Notary Journal Requests:</strong> Under Texas law, notary journals are public records, and
              certified copies of journal entries may be provided to individuals who present a written request that
              includes the name of the parties, the document date, and the type of document.
            </li>
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your information in connection with a
              merger, acquisition, reorganization, or sale of assets.
            </li>
            <li>
              <strong>Service Providers:</strong> We may share information with third-party vendors, service providers,
              and contractors who perform services for us.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share your information with third parties when you have given
              us your consent to do so.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal
            information. However, please be aware that no method of transmission over the internet or electronic storage
            is 100% secure, and we cannot guarantee absolute security.
          </p>
          <p>
            Our notaries take special precautions to protect their notary journals, including keeping them in secure,
            locked locations when not in use.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Cookies and Similar Technologies</h2>
          <p>
            Our website may use cookies and similar tracking technologies to track activity and collect information
            about your browser and device. You can instruct your browser to refuse all cookies or to indicate when a
            cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our
            website.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>The right to access personal information we hold about you</li>
            <li>The right to request correction of inaccurate information</li>
            <li>The right to request deletion of your information (subject to legal requirements)</li>
            <li>The right to opt-out of marketing communications</li>
          </ul>
          <p>
            Please note that certain information, such as notary journal entries, must be retained as required by Texas
            law and cannot be deleted upon request.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
            information from children. If you are a parent or guardian and believe your child has provided us with
            personal information, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy
            Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-bold text-[#002147] mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="mb-1">Houston Mobile Notary Pros</p>
          <p className="mb-1">Phone: (281) 779-8847</p>
          <p className="mb-1">Email: contact@houstonmobilenotarypros.com</p>
        </div>
      </div>
    </div>
  )
}
