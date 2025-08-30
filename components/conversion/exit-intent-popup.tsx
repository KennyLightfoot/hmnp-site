"use client"

import { useState } from "react"
import { useExitIntent } from "@/hooks/use-exit-intent"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Phone, Calendar } from "lucide-react"
import Link from "next/link"

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useExitIntent({
    threshold: 10,
    delay: 3000, // Wait 3 seconds before enabling
    onExitIntent: () => {
      if (!hasShown) {
        setIsOpen(true)
        setHasShown(true)
        // Track exit intent event
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "exit_intent_triggered", {
            event_category: "engagement",
            event_label: "popup_shown",
          })
        }
      }
    },
  })

  const handleBookNow = () => {
    setIsOpen(false)
    // Track conversion
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exit_intent_conversion", {
        event_category: "conversion",
        event_label: "book_now_clicked",
      })
    }
  }

  const handleCallNow = () => {
    setIsOpen(false)
    // Track phone call conversion
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exit_intent_phone_call", {
        event_category: "conversion",
        event_label: "call_now_clicked",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-xl font-bold">Wait! Don't Leave Empty-Handed</DialogTitle>
          <DialogDescription className="text-base">
            Get your documents notarized today with Houston's most trusted mobile notary service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-accent/5 rounded-lg p-4 text-center border border-accent/20">
            <Badge className="mb-2 bg-accent text-accent-foreground">Limited Time</Badge>
            <p className="font-semibold text-lg">$10 OFF Your First Service</p>
            <p className="text-sm text-muted-foreground">Professional, licensed, and insured notary services</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold">Licensed</div>
              <div className="text-muted-foreground">& Insured</div>
            </div>
            <div>
              <div className="font-semibold">7AM-9PM</div>
              <div className="text-muted-foreground">Daily</div>
            </div>
            <div>
              <div className="font-semibold">Same Day</div>
              <div className="text-muted-foreground">Service</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full bg-accent hover:bg-accent/90" onClick={handleBookNow}>
            <Link href="/booking" className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Book Now & Save $10
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full bg-transparent" onClick={handleCallNow}>
            <a href="tel:+17135550123" className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Call (713) 555-0123
            </a>
          </Button>

          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setIsOpen(false)}>
            No thanks, I'll browse more
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
