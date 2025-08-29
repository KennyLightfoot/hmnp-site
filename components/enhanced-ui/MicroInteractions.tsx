'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Heart, Star, CheckCircle, Zap, Sparkles } from 'lucide-react'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function CountUp({ end, duration = 2, prefix = '', suffix = '', className }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          requestAnimationFrame(animateCount)
        }
      }
      requestAnimationFrame(animateCount)
    }
  }, [isInView, end, duration])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  )
}

interface FloatingHeartProps {
  onComplete?: () => void
}

export function FloatingHeart({ onComplete }: FloatingHeartProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ opacity: 1, scale: 0.8, y: 0 }}
      animate={{ 
        opacity: 0, 
        scale: 1.2, 
        y: -100,
        x: [0, 20, -20, 0]
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
    >
      <Heart className="w-6 h-6 text-red-500 fill-current" />
    </motion.div>
  )
}

interface LikeButtonProps {
  initialLikes?: number
  className?: string
}

export function LikeButton({ initialLikes = 0, className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [hearts, setHearts] = useState<number[]>([])

  const handleLike = () => {
    if (!isLiked) {
      setLikes(prev => prev + 1)
      setIsLiked(true)
      
      // Add floating heart
      const heartId = Date.now()
      setHearts(prev => [...prev, heartId])
    }
  }

  const removeHeart = (heartId: number) => {
    setHearts(prev => prev.filter(id => id !== heartId))
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.button
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors",
          isLiked 
            ? "bg-red-50 border-red-200 text-red-600" 
            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
        )}
        onClick={handleLike}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={isLiked ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
        </motion.div>
        <span className="font-medium">{likes}</span>
      </motion.button>

      {/* Floating hearts */}
      {hearts.map(heartId => (
        <FloatingHeart 
          key={heartId} 
          onComplete={() => removeHeart(heartId)}
        />
      ))}
    </div>
  )
}

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  animated = true,
  className 
}: StarRatingProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div ref={ref} className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating)
        const partial = i === Math.floor(rating) && rating % 1 !== 0

        return (
          <motion.div
            key={i}
            initial={animated ? { opacity: 0, scale: 0 } : {}}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={animated ? { 
              delay: i * 0.1, 
              duration: 0.3,
              type: "spring",
              stiffness: 500
            } : {}}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  filled ? "text-yellow-400 fill-current" : 
                  partial ? "text-yellow-400 fill-current opacity-60" : 
                  "text-gray-300"
                )}
              />
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

interface PulseIndicatorProps {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'primary'
  className?: string
}

export function PulseIndicator({ 
  active = true, 
  size = 'md', 
  color = 'green',
  className 
}: PulseIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    primary: 'bg-primary'
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <motion.div
        className={cn("rounded-full", sizeClasses[size], colorClasses[color])}
        animate={active ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.8, 1]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {active && (
        <motion.div
          className={cn(
            "absolute rounded-full border-2",
            sizeClasses[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'lg'],
            `border-${color}-400`
          )}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )
}

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function TypewriterText({ 
  text, 
  speed = 50, 
  delay = 0, 
  className,
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !isComplete) {
      let i = 0
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setDisplayedText(text.slice(0, i + 1))
          i++
          
          if (i === text.length) {
            clearInterval(interval)
            setIsComplete(true)
            onComplete?.()
          }
        }, speed)

        return () => clearInterval(interval)
      }, delay)

      return () => clearTimeout(timer)
    }
    
    // Return empty cleanup function when conditions aren't met
    return () => {}
  }, [isInView, text, speed, delay, isComplete, onComplete])

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </span>
  )
}

interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SuccessCheckmark({ size = 'md', className }: SuccessCheckmarkProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <motion.div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-green-500 text-white",
        sizeClasses[size],
        className
      )}
      initial={{ scale: 0, rotate: 180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 15
      }}
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.2,
          ease: "easeInOut"
        }}
      >
        <CheckCircle className={cn(
          "text-white",
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
        )} />
      </motion.div>
    </motion.div>
  )
}

interface ShimmerButtonProps {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
}

export function ShimmerButton({ 
  children, 
  className,
  shimmerColor = 'rgba(255,255,255,0.3)'
}: ShimmerButtonProps) {
  return (
    <motion.button
      className={cn(
        "relative overflow-hidden bg-primary text-white px-6 py-3 rounded-lg font-medium",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      
      <motion.div
        className="absolute inset-0 -skew-x-12"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          width: '200%',
          left: '-100%'
        }}
        animate={{
          left: ['100%', '-100%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  )
}

