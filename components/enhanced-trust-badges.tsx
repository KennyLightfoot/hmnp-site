import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Clock, Users, Star, CheckCircle, Lock, Phone, MapPin } from "lucide-react"

export function EnhancedTrustBadges() {
  const primaryBadges = [
    {
      name: "Texas Licensed Notary",
      icon: Shield,
      description: "State-certified and authorized",
      color: "text-green-600",
    },
    {
      name: "NNA Certified",
      icon: Award,
      description: "National Notary Association certified",
      color: "text-blue-600",
    },
    {
      name: "$1M E&O Insurance",
      icon: Shield,
      description: "Fully insured and bonded",
      color: "text-purple-600",
    },
    {
      name: "Background Checked",
      icon: CheckCircle,
      description: "Thoroughly vetted professionals",
      color: "text-green-600",
    },
  ]

  const securityBadges = [
    { name: "256-bit SSL Encryption", icon: Lock },
    { name: "HIPAA Compliant", icon: Shield },
    { name: "RON Platform Certified", icon: Award },
    { name: "Identity Verified", icon: CheckCircle },
  ]

  const serviceBadges = [
    { name: "Same-Day Service", icon: Clock },
    { name: "24/7 RON Available", icon: Phone },
    { name: "60-Mile Service Area", icon: MapPin },
    { name: "Mobile & In-Office", icon: Users },
  ]

  return (
    <div className="space-y-12">
      {/* Primary Certifications */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryBadges.map((badge) => {
          const IconComponent = badge.icon
          return (
            <Card key={badge.name} className="border-primary/20 hover:border-primary/40 transition-colors group">
              <CardContent className="p-4 text-center">
                <IconComponent
                  className={`h-8 w-8 mx-auto mb-2 ${badge.color} group-hover:scale-110 transition-transform`}
                />
                <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security & Compliance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Security & Compliance</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {securityBadges.map((badge) => {
            const IconComponent = badge.icon
            return (
              <Badge key={badge.name} variant="outline" className="px-3 py-2 bg-background/50">
                <IconComponent className="h-4 w-4 mr-2" />
                {badge.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Service Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Service Features</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {serviceBadges.map((badge) => {
            const IconComponent = badge.icon
            return (
              <Badge key={badge.name} variant="secondary" className="px-3 py-2">
                <IconComponent className="h-4 w-4 mr-2" />
                {badge.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Satisfaction Guarantee */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Shield className="h-6 w-6 text-green-600" />
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">100% Satisfaction Guarantee</h3>
          <p className="text-muted-foreground mb-4">
            We stand behind our work with a complete satisfaction guarantee. If you're not happy, we'll make it right or
            provide a full refund.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Professional service</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
