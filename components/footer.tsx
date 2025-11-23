// import Image from "next/image"
import Link from "next/link"
import { Facebook } from 'lucide-react'
import { getBusinessPhoneFormatted, getBusinessTel } from "@/lib/phone"

export default function Footer() {
  return (
    <footer className="bg-secondary/5 border-t">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Houston Mobile Notary Pros"
                className="h-10 w-auto"
                loading="lazy"
                decoding="async"
              />
              <span className="sr-only">Houston Mobile Notary Pros</span>
            </Link>
            <p className="mt-4 text-sm text-secondary/80 max-w-sm">
              Fast, precise mobile notarization across Houston. Licensed, bonded, and insured.
            </p>
            <div className="mt-4 text-sm text-secondary/80">
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <a href={`tel:${getBusinessTel()}`} className="underline hover:text-secondary">
                  {getBusinessPhoneFormatted()}
                </a>
              </p>
              <p><span className="font-medium">Email:</span> contact@houstonmobilenotarypros.com</p>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-secondary mb-3">Opportunities</h4>
              <ul className="space-y-2 text-sm text-secondary/80">
                <li>
                  <Link href="/work-with-us" className="hover:text-secondary">
                    Work With Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-secondary/80">
              <li><Link href="/services/mobile-notary" className="hover:text-secondary">Mobile Notary</Link></li>
              <li><Link href="/services/loan-signing-specialist" className="hover:text-secondary">Loan Signing</Link></li>
              <li><Link href="/services/remote-online-notarization" className="hover:text-secondary">Online (RON)</Link></li>
              <li><Link href="/pricing" className="hover:text-secondary">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">Areas</h4>
            <ul className="space-y-2 text-sm text-secondary/80">
              {[
                { label: "Houston", slug: "houston" },
                { label: "Texas City", slug: "texas-city" },
                { label: "League City", slug: "league-city" },
                { label: "Pearland", slug: "pearland" },
                { label: "Sugar Land", slug: "sugar-land" },
                { label: "Pasadena", slug: "pasadena" },
              ].map((area) => (
                <li key={area.slug}>
                  <Link href={`/service-areas/${area.slug}`} className="hover:text-secondary">
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6">
          <div className="text-xs text-secondary/70">
            &copy; {new Date().getFullYear()} Houston Mobile Notary Pros LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms-of-service" className="text-xs text-secondary/60 hover:text-secondary hover:underline">Terms</Link>
            <Link href="/privacy-policy" className="text-xs text-secondary/60 hover:text-secondary hover:underline">Privacy</Link>
            <Link href="https://www.facebook.com/HoustonMobileNotaryPros/" target="_blank" rel="noopener noreferrer" aria-label="Houston Mobile Notary Pros on Facebook" className="text-secondary/80 hover:text-secondary">
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
