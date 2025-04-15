import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#002147] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Houston Mobile Notary Pros</h3>
            <p className="mb-4">Professional notary services day & evening. We come to you!</p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="hover:text-[#A52A2A]">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://instagram.com" className="hover:text-[#A52A2A]">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://twitter.com" className="hover:text-[#A52A2A]">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#A52A2A]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#A52A2A]">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[#A52A2A]">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#A52A2A]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#A52A2A]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#essential" className="hover:text-[#A52A2A]">
                  Essential Package
                </Link>
              </li>
              <li>
                <Link href="/services#priority" className="hover:text-[#A52A2A]">
                  Priority Service
                </Link>
              </li>
              <li>
                <Link href="/services#loan" className="hover:text-[#A52A2A]">
                  Loan Signing
                </Link>
              </li>
              <li>
                <Link href="/services#specialty" className="hover:text-[#A52A2A]">
                  Specialty Services
                </Link>
              </li>
              <li>
                <Link href="/services#business" className="hover:text-[#A52A2A]">
                  Business Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                <span>info@houstonmobilenotarypros.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-[#A52A2A]" />
                <span>Serving 30-mile radius from ZIP 77591</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Houston Mobile Notary Pros. All rights reserved.</p>
          <p className="mt-2 text-sm text-gray-400">
            "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR
            LEGAL ADVICE."
          </p>
        </div>
      </div>
    </footer>
  )
}
