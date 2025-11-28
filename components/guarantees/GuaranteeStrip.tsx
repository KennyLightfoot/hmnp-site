import { Shield, Clock, CheckCircle, Award } from "lucide-react"
import Link from "next/link"

interface GuaranteeStripProps {
  variant?: "banner" | "compact" | "inline"
  className?: string
}

export default function GuaranteeStrip({ variant = "banner", className = "" }: GuaranteeStripProps) {
  const guarantees = [
    {
      icon: Shield,
      title: "Flawless Execution",
      description: "Flawless the first time—or we pay the redraw fee",
      terms: "Valid for notarization errors due to our oversight",
    },
    {
      icon: Clock,
      title: "On-Time Guarantee",
      description: "Arrive within 15 minutes or $25 credit",
    },
    {
      icon: CheckCircle,
      title: "30-Day Satisfaction",
      description: "Full refund if not completely satisfied",
    },
    {
      icon: Award,
      title: "Licensed & Insured",
      description: "$100K E&O insurance for your peace of mind",
    },
  ]

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-[#002147] to-[#001a38] border-2 border-[#A52A2A] rounded-lg px-6 py-4 ${className}`}>
        <div className="flex items-center justify-center flex-wrap gap-6 text-white">
          {guarantees.slice(0, 2).map((guarantee, index) => {
            const Icon = guarantee.icon
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-[#A52A2A]" />
                <span className="font-semibold">{guarantee.title}:</span>
                <span className="text-gray-200">{guarantee.description}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {guarantees.map((guarantee, index) => {
          const Icon = guarantee.icon
          return (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <Icon className="h-6 w-6 text-[#A52A2A] mx-auto mb-2" />
              <h3 className="font-semibold text-[#002147] text-sm mb-1">{guarantee.title}</h3>
              <p className="text-xs text-gray-600">{guarantee.description}</p>
            </div>
          )
        })}
      </div>
    )
  }

  // Default banner variant
  return (
    <div className={`bg-gradient-to-r from-[#002147] to-[#001a38] border-2 border-[#A52A2A] rounded-lg px-8 py-6 ${className}`}>
      <div className="flex items-center justify-center">
        <svg className="w-8 h-8 text-[#A52A2A] mr-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div className="text-center">
          <div className="text-xl font-bold text-[#A52A2A] mb-2">OUR GUARANTEES</div>
          <div className="text-white font-semibold text-lg mb-1">Flawless the first time—or we pay the redraw fee</div>
          <div className="text-xs text-[#91A3B0] mt-2">
            *Terms apply. Valid for notarization errors due to our oversight.{" "}
            <Link href="/terms-of-service" className="underline hover:text-white">
              See full terms
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#A52A2A]" />
              <span>On-Time: $25 credit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#A52A2A]" />
              <span>30-Day Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#A52A2A]" />
              <span>$100K E&O Insurance</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#A52A2A]" />
              <span>Licensed & Bonded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

