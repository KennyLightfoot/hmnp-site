import {
  Clock,
  Award,
  CheckCircle,
  Shield,
  MessageSquareText,
  Target,
} from "lucide-react"

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-secondary/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#002147] font-medium">Why Choose Us</span>
          </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">The Houston Mobile Notary Pros Difference</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            More than just notarizations—we deliver peace of mind through meticulous care, clear communication, and unwavering professionalism.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center max-w-xs">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002147] mb-2 text-center">Effortless & On-Time Service</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              We come to you, ready and professional, respecting your time. Expect punctuality and full preparation for every signing.
            </p>
            <div className="w-10 h-1 bg-primary mx-auto mt-3"></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center max-w-xs">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002147] mb-2 text-center">Experience & Expertise</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Our notaries are experienced professionals with specialized training. We are committed to continuous learning and staying updated on all Texas notary laws. {/* TODO: Add NNA/LSS certs */}
            </p>
            <div className="w-10 h-1 bg-primary mx-auto mt-3"></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center max-w-xs">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002147] mb-2 text-center">Unyielding Precision</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Accuracy isn't a feature—it's our default. We double-check every detail, from ID verification to signatures, preventing errors and delays.
            </p>
            <div className="w-10 h-1 bg-primary mx-auto mt-3"></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center max-w-xs">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <MessageSquareText className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002147] mb-2 text-center">Clear Communication</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              No jargon, no confusion. We believe clarity creates confidence, so we explain documents in plain English and guide you with patience, not pressure.
            </p>
            <div className="w-10 h-1 bg-primary mx-auto mt-3"></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center max-w-xs">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-lg font-semibold text-[#002147] mb-2 text-center">Trusted & Secure</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Fully insured with $100k E&O coverage (meeting Texas requirements). We ensure strict compliance with all Texas notary laws and protect your confidentiality, always.
            </p>
            <div className="w-10 h-1 bg-primary mx-auto mt-3"></div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-secondary text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">500+</p>
            <p className="text-sm">Satisfied Clients</p>
          </div>
          <div className="bg-primary text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">20+</p>
            <p className="text-sm">Mile Service Radius</p>
          </div>
          <div className="bg-accent text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">7</p>
            <p className="text-sm">Days a Week</p>
          </div>
          <div className="bg-secondary text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">100%</p>
            <p className="text-sm">Satisfaction Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  )
} 