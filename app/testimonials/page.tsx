import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import TestimonialCard from "@/components/testimonial-card"

// Sample testimonial data - expanded version
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Houston, TX",
    service: "Essential Mobile Package",
    rating: 5,
    date: "June 15, 2023",
    content:
      "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
    featured: true,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "July 3, 2023",
    content:
      "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed. The process was much less stressful than I anticipated!",
  },
  {
    id: 3,
    name: "Jennifer Williams",
    location: "Sugar Land, TX",
    service: "Priority Service Package",
    rating: 4.5,
    date: "May 22, 2023",
    content:
      "I needed a notary urgently for some time-sensitive documents. I called in the morning and they had someone at my office by lunchtime. The service was prompt and professional. Would definitely use again!",
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Katy, TX",
    service: "Reverse Mortgage Signing",
    rating: 5,
    date: "August 10, 2023",
    content:
      "The notary who handled our reverse mortgage signing was knowledgeable and patient. They took the time to ensure we understood each document before signing. Their expertise made a complex process much easier.",
  },
  {
    id: 5,
    name: "Lisa Chen",
    location: "The Woodlands, TX",
    service: "Weekend Service",
    rating: 5,
    date: "September 5, 2023",
    content:
      "I was impressed that they could accommodate my request for a Sunday appointment. The notary was professional and efficient, and the additional weekend fee was well worth the convenience. Great service!",
  },
  {
    id: 6,
    name: "Robert Garcia",
    location: "Galveston, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "July 28, 2023",
    content:
      "Despite being at the edge of their service area, they arrived on time and provided excellent service. The notary was friendly and professional. I appreciated their willingness to travel to my location.",
  },
  {
    id: 7,
    name: "Emily Foster",
    location: "League City, TX",
    service: "Specialty Services - Apostille",
    rating: 5,
    date: "August 15, 2023",
    content:
      "I needed documents notarized and prepared for apostille for international use. The notary was knowledgeable about the process and helped ensure everything was properly prepared. Saved me so much time and hassle!",
  },
  {
    id: 8,
    name: "James Wilson",
    location: "Baytown, TX",
    service: "Priority Service Package",
    rating: 5,
    date: "September 12, 2023",
    content:
      "Had an urgent need for notarization on a Sunday evening. They responded quickly and had a notary at my home within 2 hours. The service was professional and exactly what I needed in a time crunch. Worth every penny!",
  },
  {
    id: 9,
    name: "Maria Gonzalez",
    location: "Missouri City, TX",
    service: "Loan Signing Service",
    rating: 4.5,
    date: "July 19, 2023",
    content:
      "The loan signing agent was punctual and very knowledgeable. They guided us through a stack of documents with patience and clarity. Made our first home purchase less intimidating. Highly recommend!",
  },
  {
    id: 10,
    name: "Thomas Lee",
    location: "Friendswood, TX",
    service: "Business Package",
    rating: 5,
    date: "June 30, 2023",
    content:
      "We use Houston Mobile Notary Pros for our business needs on a regular basis. Their business package is perfect for our company, and the consistent, reliable service has made document processing so much more efficient.",
  },
  {
    id: 11,
    name: "Sophia Martinez",
    location: "Houston, TX",
    service: "Healthcare Provider Package",
    rating: 5,
    date: "August 5, 2023",
    content:
      "As a healthcare facility, we needed a notary service that understood HIPAA compliance and could work with our patients. Their healthcare package has been perfect, and the notaries are always professional and compassionate.",
  },
  {
    id: 12,
    name: "William Brown",
    location: "Pearland, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "September 8, 2023",
    content:
      "Needed several documents notarized for a real estate transaction. The notary was prompt, professional, and made the process quick and easy. Appreciated the convenience of having them come to my home office.",
  },
]

export default function TestimonialsPage() {
  // Group testimonials by service type
  const serviceTypes = [...new Set(testimonials.map((t) => t.service.split(" - ")[0]))]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Client Testimonials</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Don't just take our word for it. Read what our clients have to say about our mobile notary services.
        </p>
      </div>

      {/* Featured Testimonials */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Featured Testimonials</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials
            .filter((t) => t.featured)
            .map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                name={testimonial.name}
                location={testimonial.location}
                service={testimonial.service}
                rating={testimonial.rating}
                date={testimonial.date}
                content={testimonial.content}
                featured={testimonial.featured}
              />
            ))}
        </div>
      </div>

      {/* Testimonials by Service Type */}
      {serviceTypes.map((serviceType) => {
        const serviceTestimonials = testimonials.filter((t) => t.service.startsWith(serviceType))
        if (serviceTestimonials.length === 0) return null

        return (
          <div key={serviceType} className="mb-16">
            <h2 className="text-2xl font-bold text-[#002147] mb-6">{serviceType} Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {serviceTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                  featured={false}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Leave a Review CTA */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
          <p className="mb-6">
            We value your feedback! If you've used our services, please consider leaving a review to help others make
            informed decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              <MessageSquare className="mr-2 h-5 w-5" />
              Leave a Google Review
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
