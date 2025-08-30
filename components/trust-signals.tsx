import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Clock, Users, Star, CheckCircle, FileText } from "lucide-react"

export function TrustSignals() {
  const certifications = [
    { name: "Texas Licensed Notary", icon: Shield },
    { name: "Certified Loan Signing Agent", icon: Award },
    { name: "NNA Certified", icon: CheckCircle },
    { name: "$1M E&O Insurance", icon: Shield },
  ]

  const stats = [
    { value: "5,000+", label: "Documents Notarized", icon: FileText },
    { value: "99%", label: "Client Satisfaction", icon: Star },
    { value: "24/7", label: "RON Availability", icon: Clock },
    { value: "500+", label: "Happy Clients", icon: Users },
  ]

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Certifications */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-primary border-primary/20 mb-4">
            Licensed & Certified
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-bold mb-8">Trusted by Houston Professionals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert) => {
              const IconComponent = cert.icon
              return (
                <Card key={cert.name} className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-sm font-medium">{cert.name}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <IconComponent className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <Card className="bg-accent/5 border-accent/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">100% Satisfaction Guarantee</h3>
              <p className="text-muted-foreground">
                We stand behind our work. If you're not completely satisfied with our service, we'll make it right or
                provide a full refund.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
