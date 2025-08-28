import { Star } from 'lucide-react'

export default function SocialProof() {
  const brands = [
    { name: 'Google', href: '/reviews' },
    { name: 'Yelp', href: '/reviews' },
    { name: 'BBB', href: '/reviews' },
    { name: 'Facebook', href: '/reviews' },
    { name: 'Nextdoor', href: '/reviews' },
  ]

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 text-[#0F1419]">
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <span className="text-sm text-[#0F1419]/80">4.9 average • 500+ jobs • 25‑mile radius</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {brands.map((b) => (
              <a
                key={b.name}
                href={b.href}
                className="px-3 py-1.5 rounded-full text-xs md:text-sm border border-black/10 text-[#0F1419]/80 hover:text-[#0F1419] hover:border-black/20 transition-colors"
              >
                {b.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}




