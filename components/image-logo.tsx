import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageLogoProps {
  className?: string
  width?: number
  height?: number
}

export function ImageLogo({ className, width = 50, height = 50 }: ImageLogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-kx4s1l0RVBrt0pU3e2RJCg8iYRDGqp.png"
        alt="Houston Mobile Notary Pros"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

