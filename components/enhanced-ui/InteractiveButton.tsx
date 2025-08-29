'use client'

import { motion } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface InteractiveButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  ripple?: boolean
  glow?: boolean
  pulse?: boolean
}

export default function InteractiveButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ripple = true,
  glow = false,
  pulse = false,
  onClick,
  ...props
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const newRipple = { id: Date.now(), x, y }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }
    
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    
    if (onClick) onClick(e)
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-2 h-10',
    lg: 'px-6 py-3 text-lg h-12',
    xl: 'px-8 py-4 text-xl h-14'
  }

  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white border-primary',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white border-secondary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-primary hover:bg-primary/10'
  }

  return (
    <motion.div className="relative inline-block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: pulse ? [1, 1.05, 1] : 1,
        }}
        transition={{
          scale: pulse ? { duration: 2, repeat: Infinity } : { duration: 0.2 },
        }}
      >
        <Button
          className={cn(
            'relative overflow-hidden transition-all duration-300 font-semibold',
            'transform-gpu', // Enable hardware acceleration
            sizeClasses[size],
            variantClasses[variant],
            glow && 'shadow-lg hover:shadow-xl',
            glow && variant === 'primary' && 'shadow-primary/25 hover:shadow-primary/40',
            glow && variant === 'secondary' && 'shadow-secondary/25 hover:shadow-secondary/40',
            isPressed && 'scale-95',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{
              translateX: ['100%', '-100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear'
            }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              width: '50%'
            }}
          />
          
          {/* Ripple effects */}
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
              }}
              animate={{
                width: 300,
                height: 300,
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
          
          {/* Button content */}
          <span className="relative z-10 flex items-center gap-2">
            {children}
          </span>
        </Button>
      </motion.div>
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
          whileHover={{ opacity: 0.6 }}
          style={{
            background: variant === 'primary' 
              ? 'radial-gradient(circle, rgba(165,42,42,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0,33,71,0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
    </motion.div>
  )
}

