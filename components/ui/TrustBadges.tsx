'use client'

import { Shield, Star, Users, Award, Clock, MapPin, CheckCircle, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const trustBadges = [
  {
    icon: Shield,
    text: 'NNA Certified & Insured',
    detail: 'Background checked and certified by National Notary Association',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    icon: Star,
    text: '4.9★ Customer Rating',
    detail: 'Based on 500+ verified customer reviews',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    icon: Users,
    text: '500+ Jobs Completed',
    detail: 'Trusted by hundreds of Houston residents',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    icon: Award,
    text: 'Licensed & Bonded',
    detail: '$100,000 E&O insurance protection',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    icon: Clock,
    text: 'Same-Day Service',
    detail: 'Available 7 days a week, typically within 1-2 hours',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    icon: MapPin,
    text: '25-Mile Coverage',
    detail: 'Serving Greater Houston Metropolitan Area',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  }
]

interface TrustBadgesProps {
  variant?: 'grid' | 'carousel' | 'compact'
  className?: string
}

export default function TrustBadges({ variant = 'grid', className = '' }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-6 text-xs text-gray-500 ${className}`}>
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-green-500" />
          <span>Licensed & Insured</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500" />
          <span>4.9★ Rating</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-blue-500" />
          <span>No Hidden Fees</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-orange-500" />
          <span>Same-Day Available</span>
        </div>
      </div>
    )
  }

  if (variant === 'carousel') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon
          return (
            <div
              key={badge.text}
              className={`p-4 rounded-lg border ${badge.bgColor} ${badge.borderColor} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${badge.bgColor}`}>
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{badge.text}</div>
                  <div className="text-xs text-gray-600">{badge.detail}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Default grid variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {trustBadges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div
            key={badge.text}
            className={`p-4 rounded-lg border ${badge.bgColor} ${badge.borderColor} hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${badge.bgColor}`}>
                <Icon className={`h-5 w-5 ${badge.color}`} />
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{badge.text}</div>
                <div className="text-xs text-gray-600">{badge.detail}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}









