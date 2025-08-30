import { Badge } from "@/components/ui/badge"
import { Shield, Award, CheckCircle, Clock, Star } from "lucide-react"

export function MiniTrustBadges() {
  const badges = [
    { icon: Shield, text: "Licensed", color: "text-green-600" },
    { icon: Award, text: "NNA Certified", color: "text-blue-600" },
    { icon: CheckCircle, text: "Insured", color: "text-green-600" },
    { icon: Clock, text: "Same Day", color: "text-orange-600" },
    { icon: Star, text: "4.9/5 Rating", color: "text-yellow-600" },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {badges.map((badge) => {
        const IconComponent = badge.icon
        return (
          <Badge key={badge.text} variant="outline" className="px-2 py-1 text-xs bg-background/50">
            <IconComponent className={`h-3 w-3 mr-1 ${badge.color}`} />
            {badge.text}
          </Badge>
        )
      })}
    </div>
  )
}
