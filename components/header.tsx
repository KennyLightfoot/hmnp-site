import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-[#002147]">
            Houston Mobile Notary Pros
          </Link>
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <Link href="/services" className="text-[#002147] hover:text-[#A52A2A]">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#002147] hover:text-[#A52A2A]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/booking">
                  <Button className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">Book Now</Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
