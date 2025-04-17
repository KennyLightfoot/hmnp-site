import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Houston Mobile Notary Pros" width={150} height={150} className="h-16 w-auto" />
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/services" className="text-[#002147] hover:text-[#A52A2A]">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-[#002147] hover:text-[#A52A2A]">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-[#002147] hover:text-[#A52A2A]">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#002147] hover:text-[#A52A2A]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#002147] hover:text-[#A52A2A]">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
