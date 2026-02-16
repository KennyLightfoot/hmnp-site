"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ReviewsModal() {
  const [open, setOpen] = useState(false)
  return (
    <div className="container mx-auto px-4 py-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3">
          <a href="https://www.google.com/maps/search/?api=1&query=Houston+Mobile+Notary+Pros" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-4 hover:text-secondary/80 transition-colors">
            Read 100+ Google reviews
          </a>
        </div>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Client Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black/5 rounded-xl overflow-hidden">
              {/* Placeholder for 20–30s video testimonial; swap to actual embed when available */}
              <video controls preload="metadata" className="w-full h-full object-cover">
                <source src="/testimonials/sample.mp4" type="video/mp4" />
              </video>
            </div>
            <ul className="text-sm text-[#0F1419]/90 space-y-2 max-h-[320px] overflow-auto pr-2">
              <li>“They came to the hospital within an hour. Professional and kind.” — Angela M.</li>
              <li>“Transparent price and on-time. Highly recommend.” — Robert C.</li>
              <li>“Booked online and got it done same-day in Webster.” — Tina H.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}







