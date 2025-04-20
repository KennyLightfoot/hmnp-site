import { Clock, Calendar, Phone } from "lucide-react"

export default function ServiceHoursBanner() {
  return (
    <section className="bg-[#002147] text-white py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <div className="bg-[#91A3B0] p-2 rounded-full mr-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Essential Services</p>
              <p className="text-white/80 text-xs">Mon-Fri, 9am-5pm</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-[#91A3B0] p-2 rounded-full mr-3">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Priority Services</p>
              <p className="text-white/80 text-xs">7 days a week, 7am-9pm</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-[#A52A2A] p-2 rounded-full mr-3">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Need Same-Day Service?</p>
              <p className="text-white/80 text-xs">Call (281) 779-8847</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 