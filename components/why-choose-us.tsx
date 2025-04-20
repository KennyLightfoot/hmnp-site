import {
  Clock,
  Award,
  CheckCircle,
  Shield,
} from "lucide-react"

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#002147]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#002147] font-medium">Why Choose Us</span>
          </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">The Houston Mobile Notary Pros Difference</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing exceptional notary services with professionalism, convenience, and
            reliability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Convenience</h3>
            <p className="text-gray-600 text-center">
              We come to your location, saving you time and hassle. Available evenings and weekends.
            </p>
            <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Experience</h3>
            <p className="text-gray-600 text-center">
              Our notaries are experienced professionals with specialized training in all types of notarizations.
            </p>
            <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Reliability</h3>
            <p className="text-gray-600 text-center">
              We arrive on time, every time. Our notaries are punctual, professional, and prepared.
            </p>
            <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="bg-[#002147]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-[#002147]" />
            </div>
            <h3 className="text-xl font-semibold text-[#002147] mb-3 text-center">Trusted</h3>
            <p className="text-gray-600 text-center">
              Fully insured with $100k E&O coverage. Strict compliance with all Texas notary laws.
            </p>
            <div className="w-12 h-1 bg-[#A52A2A] mx-auto mt-4"></div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#002147] text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">500+</p>
            <p className="text-sm">Satisfied Clients</p>
          </div>
          <div className="bg-[#A52A2A] text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">20+</p>
            <p className="text-sm">Mile Service Radius</p>
          </div>
          <div className="bg-[#91A3B0] text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">7</p>
            <p className="text-sm">Days a Week</p>
          </div>
          <div className="bg-[#002147] text-white p-6 rounded-lg text-center">
            <p className="text-4xl font-bold mb-2">100%</p>
            <p className="text-sm">Satisfaction Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  )
} 