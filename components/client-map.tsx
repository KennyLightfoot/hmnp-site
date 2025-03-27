"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Dynamically import the ServiceAreaMap component
const ServiceAreaMap = dynamic(() => import("@/components/service-area-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-md border">
      <LoadingSpinner size="lg" text="Loading map..." />
    </div>
  ),
})

export default function ClientMap() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-md border">
          <LoadingSpinner size="lg" text="Loading map..." />
        </div>
      }
    >
      <ServiceAreaMap />
    </Suspense>
  )
}

