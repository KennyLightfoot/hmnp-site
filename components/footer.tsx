import Link from "next/link"
import { SocialLinks } from "@/components/social-links"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Houston Mobile Notary Pros</h3>
            <p className="text-muted-foreground">
              Professional notary services day & evening throughout the Houston area.
            </p>
            <SocialLinks />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/essential" className="text-foreground hover:text-primary transition-colors">
                  Essential Package
                </Link>
              </li>
              <li>
                <Link href="/services/priority" className="text-foreground hover:text-primary transition-colors">
                  Priority Service
                </Link>
              </li>
              <li>
                <Link href="/services/loan-signing" className="text-foreground hover:text-primary transition-colors">
                  Loan Signing
                </Link>
              </li>
              <li>
                <Link href="/services/specialty" className="text-foreground hover:text-primary transition-colors">
                  Specialty Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-foreground hover:text-primary transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Houston Mobile Notary Pros. All rights reserved.</p>
          <p className="mt-2">
            <span className="block md:inline">Texas Notary Public #123456789</span>
            <span className="hidden md:inline mx-2">•</span>
            <span className="block md:inline">E&O Insured</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

