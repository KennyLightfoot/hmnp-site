import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialLinksProps {
  variant?: "default" | "outline"
  className?: string
}

export function SocialLinks({ variant = "default", className }: SocialLinksProps) {
  const links = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: Facebook,
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: Instagram,
    },
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: Linkedin,
    },
  ]

  const variantStyles = {
    default: "bg-primary/10 hover:bg-primary/20 text-primary",
    outline: "border border-primary/20 hover:border-primary/40 text-primary",
  }

  return (
    <div className={cn("flex space-x-3", className)}>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
            variantStyles[variant],
          )}
          aria-label={link.name}
          target="_blank"
          rel="noopener noreferrer"
        >
          <link.icon className="w-4 h-4" />
        </Link>
      ))}
    </div>
  )
}

