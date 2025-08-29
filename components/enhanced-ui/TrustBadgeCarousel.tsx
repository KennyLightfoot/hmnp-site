'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Shield, Star, Users, Award, Clock, MapPin } from 'lucide-react'

const trustBadges = [
  {
    icon: Shield,
    text: 'NNA Certified & Insured',
    detail: 'Background checked and certified by National Notary Association',
    color: 'text-green-400'
  },
  {
    icon: Star,
    text: '4.9★ Customer Rating',
    detail: 'Based on 500+ verified customer reviews',
    color: 'text-yellow-400'
  },
  {
    icon: Users,
    text: '500+ Jobs Completed',
    detail: 'Trusted by hundreds of Houston residents',
    color: 'text-blue-400'
  },
  {
    icon: Award,
    text: 'Licensed & Bonded',
    detail: '$25,000 E&O insurance protection',
    color: 'text-purple-400'
  },
  {
    icon: Clock,
    text: 'Same-Day Service',
    detail: 'Available 7 days a week, typically within 1-2 hours',
    color: 'text-orange-400'
  },
  {
    icon: MapPin,
    text: '25-Mile Coverage',
    detail: 'Serving Greater Houston Metropolitan Area',
    color: 'text-pink-400'
  }
]

export default function TrustBadgeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % trustBadges.length)
      }, 3000)
      return () => clearInterval(interval)
    }
    
    // Return empty cleanup function when hovered
    return () => {}
  }, [isHovered])

  return (
    <div className="relative">
      {/* Main carousel */}
      <motion.div
        className="flex flex-wrap gap-2 justify-center items-center min-h-[2.5rem]"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon
            const isVisible = index <= currentIndex || (currentIndex === 0 && index >= trustBadges.length - 2)
            
            if (!isVisible) return null
            
            return (
              <motion.div
                key={`${badge.text}-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="group relative"
              >
                <motion.div
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer"
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderColor: "rgba(255,255,255,0.3)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={`h-4 w-4 ${badge.color}`} />
                  <span className="text-sm text-white/90 font-medium">
                    {badge.text}
                  </span>
                </motion.div>
                
                {/* Tooltip */}
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {badge.detail}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {trustBadges.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Floating glow effects */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(165,42,42,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(0,33,71,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(165,42,42,0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(0,33,71,0.1) 0%, transparent 50%)',
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

