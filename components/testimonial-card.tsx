import { Star, StarHalf } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TestimonialCardProps {
  name: string
  location: string
  service: string
  rating: number
  date: string
  content: string
  featured?: boolean
}

export default function TestimonialCard({
  name,
  location,
  service,
  rating,
  date,
  content,
  featured = false,
}: TestimonialCardProps) {
  // Generate star rating
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-[#A52A2A] text-[#A52A2A]" />)
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-[#A52A2A] text-[#A52A2A]" />)
    }

    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <Card
      className={`h-full ${
        featured
          ? "border-[#A52A2A] shadow-lg"
          : "border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300"
      }`}
    >
      {featured && <div className="bg-[#A52A2A] text-white text-center py-1 text-sm font-medium">Featured Review</div>}
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">{renderStars()}</div>
        <blockquote className="text-gray-700 italic mb-4">"{content}"</blockquote>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 flex flex-col items-start pt-4">
        <div className="font-semibold text-[#002147]">{name}</div>
        <div className="text-sm text-gray-600">{location}</div>
        <div className="flex justify-between w-full mt-2 text-xs text-gray-500">
          <span>{service}</span>
          <span>{date}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
