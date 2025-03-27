"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ClientMap from "@/components/client-map"

export function ServiceAreaSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Service Area</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              We provide mobile notary services throughout the Greater Houston area
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl mt-8 md:mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <ClientMap />
              </div>
              <div className="mt-6 text-center">
                <p className="mb-4">Not sure if you're in our service area? Contact us to confirm availability.</p>
                <Button asChild>
                  <a href="/contact">Check Availability</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

