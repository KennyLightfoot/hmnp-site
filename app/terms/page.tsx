import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Review the terms and conditions for using Houston Mobile Notary Pros services.",
  robots: { // Ensure search engines don't index placeholder pages
    index: false,
    follow: false,
  },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#002147] mb-6">Terms and Conditions</h1>
        <div className="prose max-w-none">
          {/* Placeholder Content */}
          <p>
            The terms and conditions for using our services will be detailed here.
          </p>
          <p>
            Please check back later or contact us if you have immediate questions regarding our terms.
          </p>
          {/* Add actual terms and conditions content here */}
        </div>
      </div>
    </div>
  )
} 