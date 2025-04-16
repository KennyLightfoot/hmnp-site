export default function Header() {
  return (
    <header className="bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-[#002147]">
            Houston Mobile Notary Pros
          </a>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/services" className="text-[#002147] hover:text-[#A52A2A]">
                  Services
                </a>
              </li>
              <li>
                <a href="/booking" className="text-[#002147] hover:text-[#A52A2A]">
                  Book Now
                </a>
              </li>
              <li>
                <a href="/testimonials" className="text-[#002147] hover:text-[#A52A2A]">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="/faq" className="text-[#002147] hover:text-[#A52A2A]">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="text-[#002147] hover:text-[#A52A2A]">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
