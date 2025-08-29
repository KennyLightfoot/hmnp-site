'use client'

import { motion } from 'framer-motion'
import { Loader2, Sparkles, Zap, Shield, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'wave' | 'premium'
  className?: string
  text?: string
}

export function PremiumSpinner({ 
  size = 'md', 
  variant = 'premium', 
  className,
  text 
}: PremiumSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("bg-primary rounded-full", {
              'w-2 h-2': size === 'sm',
              'w-3 h-3': size === 'md',
              'w-4 h-4': size === 'lg',
              'w-5 h-5': size === 'xl'
            })}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        {text && <span className="ml-3 text-sm text-gray-600">{text}</span>}
      </div>
    )
  }

  if (variant === 'wave') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: ['10px', '20px', '10px']
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
        {text && <span className="ml-3 text-sm text-gray-600">{text}</span>}
      </div>
    )
  }

  if (variant === 'premium') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Outer ring */}
          <motion.div
            className={cn("border-4 border-primary/20 rounded-full", sizeClasses[size])}
            animate={{ 
              borderColor: [
                'rgba(165,42,42,0.2)', 
                'rgba(165,42,42,0.6)', 
                'rgba(165,42,42,0.2)'
              ] 
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Inner spinning element */}
          <motion.div
            className={cn("absolute top-0 left-0 border-4 border-transparent border-t-primary rounded-full", sizeClasses[size])}
          />
          
          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className={cn("text-primary", {
              'w-2 h-2': size === 'sm',
              'w-3 h-3': size === 'md',
              'w-4 h-4': size === 'lg',
              'w-6 h-6': size === 'xl'
            })} />
          </motion.div>
        </motion.div>
        
        {text && (
          <motion.p 
            className="text-sm text-gray-600 font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={cn("text-primary", sizeClasses[size])} />
      </motion.div>
      {text && <span className="ml-3 text-sm text-gray-600">{text}</span>}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'avatar' | 'card' | 'button'
  animate?: boolean
}

export function PremiumSkeleton({ 
  className, 
  variant = 'text',
  animate = true 
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
  
  const variantClasses = {
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    card: "h-32 w-full",
    button: "h-10 w-24"
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      animate={animate ? {
        backgroundPosition: ['200% 0', '-200% 0']
      } : {}}
      transition={animate ? {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      } : {}}
      style={{
        backgroundSize: '400% 100%'
      }}
    />
  )
}

interface ProgressStepsProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <motion.div
            key={index}
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={cn("flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors", {
                'bg-green-500 border-green-500 text-white': isCompleted,
                'bg-primary border-primary text-white': isCurrent,
                'bg-gray-100 border-gray-300 text-gray-400': isPending
              })}
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : isCurrent ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </motion.div>
            
            <motion.span
              className={cn("text-sm font-medium transition-colors", {
                'text-green-600': isCompleted,
                'text-primary': isCurrent,
                'text-gray-400': isPending
              })}
              animate={isCurrent ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {step}
            </motion.span>
          </motion.div>
        )
      })}
    </div>
  )
}

interface PulseCardProps {
  children: React.ReactNode
  className?: string
  isActive?: boolean
}

export function PulseCard({ children, className, isActive = false }: PulseCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300",
        className
      )}
      animate={isActive ? {
        boxShadow: [
          '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '0 10px 15px -3px rgba(165, 42, 42, 0.2)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

