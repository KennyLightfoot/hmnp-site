"use client"

import { useEffect, useRef } from "react"

interface GHLCalendarWidgetProps {
  calendarId: string
  className?: string
}

export function GHLCalendarWidget({ calendarId, className = "" }: GHLCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!calendarId || !containerRef.current) return

    // Create script element
    const script = document.createElement("script")
    script.src = "https://widgets.gohighlevel.com/js/calendar-widget.js"
    script.async = true
    script.defer = true

    // Create div for the widget
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "ghl-calendar-widget"
    widgetDiv.setAttribute("data-calendar-id", calendarId)

    // Clear container and append widget
    if (containerRef.current) {
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(widgetDiv)
      document.body.appendChild(script)
    }

    return () => {
      // Clean up
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [calendarId])

  return (
    <div ref={containerRef} className={className}>
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-cadetGray/20 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-cadetGray/20 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-cadetGray/20 rounded"></div>
              <div className="h-4 bg-cadetGray/20 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

