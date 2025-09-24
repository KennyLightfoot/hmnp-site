"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StickySummaryProps {
  total: number
  onContinue?: () => void
  continueDisabled?: boolean
}

export function StickySummary({ total, onContinue, continueDisabled }: StickySummaryProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <Card className="rounded-none border-t shadow-lg">
        <CardContent className="flex items-center justify-between py-3">
          <div>
            <div className="text-xs text-muted-foreground">Estimated total</div>
            <div className="text-lg font-semibold">${total.toFixed(2)}</div>
          </div>
          <Button
            onClick={onContinue}
            disabled={continueDisabled}
            className="min-h-[44px] px-6"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default StickySummary





