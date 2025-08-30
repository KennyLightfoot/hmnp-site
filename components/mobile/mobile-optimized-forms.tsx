"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobileOptimizedInputProps extends React.ComponentProps<typeof Input> {
  label?: string
  error?: string
}

export function MobileOptimizedInput({ label, error, className, ...props }: MobileOptimizedInputProps) {
  const isMobile = useIsMobile()

  return (
    <div className="space-y-2">
      {label && <Label className={cn("text-sm font-medium", isMobile && "text-base")}>{label}</Label>}
      <Input
        className={cn(
          "transition-all duration-200",
          isMobile && "h-12 text-base px-4", // Larger touch targets on mobile
          error && "border-destructive focus:border-destructive",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

interface MobileOptimizedTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string
  error?: string
}

export function MobileOptimizedTextarea({ label, error, className, ...props }: MobileOptimizedTextareaProps) {
  const isMobile = useIsMobile()

  return (
    <div className="space-y-2">
      {label && <Label className={cn("text-sm font-medium", isMobile && "text-base")}>{label}</Label>}
      <Textarea
        className={cn(
          "transition-all duration-200",
          isMobile && "min-h-[120px] text-base px-4 py-3", // Better mobile experience
          error && "border-destructive focus:border-destructive",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

interface MobileOptimizedSelectProps {
  label?: string
  error?: string
  placeholder?: string
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export function MobileOptimizedSelect({
  label,
  error,
  placeholder,
  children,
  value,
  onValueChange,
}: MobileOptimizedSelectProps) {
  const isMobile = useIsMobile()

  return (
    <div className="space-y-2">
      {label && <Label className={cn("text-sm font-medium", isMobile && "text-base")}>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "transition-all duration-200",
            isMobile && "h-12 text-base px-4", // Larger touch targets
            error && "border-destructive focus:border-destructive",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

interface MobileOptimizedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function MobileOptimizedButton({ children, className, size = "default", ...props }: MobileOptimizedButtonProps) {
  const isMobile = useIsMobile()

  return (
    <Button
      size={isMobile ? "lg" : size}
      className={cn(
        "transition-all duration-200",
        isMobile && "h-12 text-base font-semibold", // Better mobile touch targets
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
