import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceFeature {
  name: string
  essential: boolean | string
  priority: boolean | string
  loan: boolean | string
}

interface ServiceComparisonProps {
  className?: string
}

export function ServiceComparison({ className }: ServiceComparisonProps) {
  const features: ServiceFeature[] = [
    { name: "Base Price", essential: "$75", priority: "$100", loan: "$150" },
    { name: "Number of Signers", essential: "1", priority: "2", loan: "Up to 4" },
    { name: "Number of Documents", essential: "2", priority: "5", loan: "Unlimited" },
    { name: "Travel Radius", essential: "20 miles", priority: "35 miles", loan: "20 miles" },
    { name: "Response Time", essential: "24-48 hours", priority: "2 hours", loan: "24 hours" },
    { name: "Weekend Availability", essential: "+$50", priority: "Included", loan: "+$50" },
    { name: "Evening Hours (after 5pm)", essential: "+$30", priority: "Included", loan: "+$30" },
    { name: "Color Printing", essential: false, priority: false, loan: true },
    { name: "Title Company Shipping", essential: false, priority: false, loan: true },
    { name: "SMS Status Updates", essential: false, priority: true, loan: false },
  ]

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b-2 border-secondary/20"></th>
            <th className="p-3 border-b-2 border-secondary/20 text-center">
              <div className="font-bold text-lg">Essential</div>
              <div className="text-sm text-muted-foreground">Standard Service</div>
            </th>
            <th className="p-3 border-b-2 border-secondary/20 text-center bg-secondary/10">
              <div className="font-bold text-lg text-primary">Priority</div>
              <div className="text-sm text-muted-foreground">Urgent Service</div>
            </th>
            <th className="p-3 border-b-2 border-secondary/20 text-center">
              <div className="font-bold text-lg">Loan Signing</div>
              <div className="text-sm text-muted-foreground">Real Estate Transactions</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-secondary/5" : ""}>
              <td className="p-3 border-b border-secondary/20 font-medium">{feature.name}</td>
              <td className="p-3 border-b border-secondary/20 text-center">
                {typeof feature.essential === "boolean" ? (
                  feature.essential ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                  )
                ) : (
                  feature.essential
                )}
              </td>
              <td className="p-3 border-b border-secondary/20 text-center bg-secondary/10">
                {typeof feature.priority === "boolean" ? (
                  feature.priority ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                  )
                ) : (
                  feature.priority
                )}
              </td>
              <td className="p-3 border-b border-secondary/20 text-center">
                {typeof feature.loan === "boolean" ? (
                  feature.loan ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                  )
                ) : (
                  feature.loan
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

