import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn about how Houston Mobile Notary Pros handles your personal information.",
  robots: { // Ensure search engines don't index placeholder pages
    index: false,
    follow: false,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#002147] mb-6">Privacy Policy</h1>
        <div className="prose max-w-none">
          {/* Placeholder Content */}
          <p>
            Our privacy policy detailing how we collect, use, and protect your data will be available here.
          </p>
          <p>
            Please check back later or contact us if you have immediate concerns about your privacy.
          </p>
          {/* Add actual privacy policy content here */}
        </div>
      </div>
    </div>
  )
} 