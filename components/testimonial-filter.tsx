"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TestimonialFilterProps {
  onFilterChange: (filter: string) => void
  onSortChange: (sort: string) => void
  totalCount: number
}

export function TestimonialFilter({ onFilterChange, onSortChange, totalCount }: TestimonialFilterProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeSort, setActiveSort] = useState("newest")

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
    onFilterChange(value)
  }

  const handleSortChange = (value: string) => {
    setActiveSort(value)
    onSortChange(value)
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Client Testimonials</h2>
        <p className="text-muted-foreground">{totalCount} reviews from satisfied clients</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={handleFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All Sources</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs defaultValue="newest" className="w-full sm:w-auto" onValueChange={handleSortChange}>
          <TabsList>
            <TabsTrigger value="newest">Newest</TabsTrigger>
            <TabsTrigger value="highest">Highest Rated</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

