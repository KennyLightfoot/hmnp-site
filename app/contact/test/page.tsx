import Link from "next/link"

export default function ContactTestPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contact Form Test Page</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            This page is for testing the contact form functionality. Use this to verify that all contact links
            throughout the site are working correctly.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Links</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/contact" className="text-primary hover:underline">
                Go to main contact page
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-primary hover:underline">
                Go to booking page
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

