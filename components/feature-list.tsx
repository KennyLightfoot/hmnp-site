import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureListProps {
  features: string[]
  className?: string
  iconClassName?: string
}

export function FeatureList({ features, className, iconClassName }: FeatureListProps) {
  return (
    <ul className={cn("space-y-2", className)}>
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <Check className={cn("h-5 w-5 mr-2 text-primary shrink-0", iconClassName)} />
          <span className="text-foreground">{feature}</span>
        </li>
      ))}
    </ul>
  )
}

