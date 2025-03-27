"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function FaqSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In a real implementation, this would search through FAQs
      // For now, we'll just scroll to the general section
      router.push("/faq#general")
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative" role="search" aria-label="Search FAQs">
      <Input
        type="text"
        placeholder="Search for answers..."
        className="pl-10 bg-background/80 backdrop-blur-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search query"
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <Button
        type="submit"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-3 text-xs"
        variant="secondary"
        aria-label="Search"
      >
        Search
      </Button>
    </form>
  )
}

