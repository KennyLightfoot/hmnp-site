import { CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ServiceComparisonTable() {
  const services = [
    {
      name: "Essential Mobile Package",
      price: "$75+",
      features: {
        "Mobile Service": true,
        "General Documents": true,
        "Same-Day Availability": true,
        "After-Hours Service": false,
        "Loan Document Expertise": false,
        "Corporate Documents": false,
      },
      highlighted: false,
      link: "/services/essential-mobile",
    },
    {
      name: "Priority Service",
      price: "$100+",
      features: {
        "Mobile Service": true,
        "General Documents": true,
        "Same-Day Availability": true,
        "After-Hours Service": true,
        "Loan Document Expertise": false,
        "Corporate Documents": false,
      },
      highlighted: false,
      link: "/services/priority-service",
    },
    {
      name: "Loan Signing",
      price: "$150+",
      features: {
        "Mobile Service": true,
        "General Documents": true,
        "Same-Day Availability": false,
        "After-Hours Service": true,
        "Loan Document Expertise": true,
        "Corporate Documents": false,
      },
      highlighted: true,
      link: "/services/loan-signing",
    },
    {
      name: "Corporate Service",
      price: "$125+",
      features: {
        "Mobile Service": true,
        "General Documents": true,
        "Same-Day Availability": false,
        "After-Hours Service": true,
        "Loan Document Expertise": false,
        "Corporate Documents": true,
      },
      highlighted: false,
      link: "/services/corporate",
    },
  ]

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-5 gap-4">
          {/* Header */}
          <div className="col-span-1 p-4"></div>
          {services.map((service, index) => (
            <div
              key={index}
              className={cn(
                "col-span-1 p-4 text-center rounded-t-lg",
                service.highlighted ? "bg-accent-500 text-white" : "bg-primary-50",
              )}
            >
              <h3 className={cn("text-lg font-bold", service.highlighted && "text-white")}>{service.name}</h3>
              <p className={cn("text-2xl font-bold mt-2", service.highlighted ? "text-white" : "text-primary-500")}>
                {service.price}
              </p>
            </div>
          ))}

          {/* Features */}
          {Object.keys(services[0].features).map((feature, featureIndex) => (
            <div
              key={featureIndex}
              className={cn("col-span-5 grid grid-cols-5 gap-4", featureIndex % 2 === 0 ? "bg-white" : "bg-gray-50")}
            >
              <div className="col-span-1 p-4 font-medium">{feature}</div>
              {services.map((service, serviceIndex) => (
                <div
                  key={serviceIndex}
                  className={cn("col-span-1 p-4 text-center", service.highlighted && "bg-accent-500/5")}
                >
                  {service.features[feature as keyof typeof service.features] ? (
                    <CheckCircle className="h-6 w-6 text-accent-500 mx-auto" />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-300 mx-auto" />
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="col-span-1 p-4"></div>
          {services.map((service, index) => (
            <div
              key={index}
              className={cn(
                "col-span-1 p-4 text-center rounded-b-lg",
                service.highlighted ? "bg-accent-500 text-white" : "bg-primary-50",
              )}
            >
              <Button
                asChild
                className={cn(
                  "w-full",
                  service.highlighted ? "bg-white text-accent-500 hover:bg-white/90" : "btn-primary",
                )}
              >
                <Link href={service.link}>Select</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

