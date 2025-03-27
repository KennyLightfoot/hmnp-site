"use client"

import { useState } from "react"
import { exportContacts, exportAppointments } from "@/lib/gohighlevel"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function DataExporter() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<"contacts" | "appointments">("contacts")

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      let data
      const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined
      const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined

      if (exportType === "contacts") {
        data = await exportContacts(formattedStartDate, formattedEndDate)
      } else {
        data = await exportAppointments(formattedStartDate, formattedEndDate)
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${exportType}_export_${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error exporting ${exportType}:`, error)
      alert(`Failed to export ${exportType}. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-4">Export GoHighLevel Data</h3>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button variant={exportType === "contacts" ? "default" : "outline"} onClick={() => setExportType("contacts")}>
            Contacts
          </Button>
          <Button
            variant={exportType === "appointments" ? "default" : "outline"}
            onClick={() => setExportType("appointments")}
          >
            Appointments
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date (Optional)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date (Optional)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {exportType}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

