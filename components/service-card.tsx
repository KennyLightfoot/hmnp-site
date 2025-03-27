import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  price: string
  priceDescription: string
  imageSrc: string
  href: string
  features: string[]
  highlighted?: boolean
}

export function ServiceCard({
  title,
  description,
  price,
  priceDescription,
  imageSrc,
  href,
  features,
  highlighted = false,
}: ServiceCardProps) {
  return (
    <div className={cn("service-card", highlighted && "service-card-highlight")}>
      <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>

      <div className="mb-4">
        <span className="text-2xl font-bold text-primary-500">{price}</span>
        <span className="text-sm text-muted-foreground ml-1">/ {priceDescription}</span>
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-accent-500 mr-2 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button asChild className={cn("w-full", highlighted ? "btn-accent" : "btn-primary")}>
          <Link href={href}>Learn More</Link>
        </Button>
      </div>
    </div>
  )
}

