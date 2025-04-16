import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Houston Mobile Notary Pros</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Professional mobile notary services that come to you.</p>
      </div>

      <div className="flex justify-center">
        <Link href="/booking">
          <Button className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">Book Now</Button>
        </Link>
      </div>
    </div>
  )
}
