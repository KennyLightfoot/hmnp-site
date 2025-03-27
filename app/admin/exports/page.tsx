"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExportsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [limit, setLimit] = useState(100)

  const handleExportContacts = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/export-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRange:
            startDate && endDate
              ? {
                  start: startDate.toISOString(),
                  end: endDate.toISOString(),
                }
              : undefined,
          limit,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAppointments = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/export-appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRange:
            startDate && endDate
              ? {
                  start: startDate.toISOString(),
                  end: endDate.toISOString(),
                }
              : undefined,
          limit,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `appointments-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Data Exports</h1>

      <Tabs defaultValue="contacts">
        <TabsList className="mb-4">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Export Contacts</CardTitle>
              <CardDescription>Export contact data to CSV format for analysis or backup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker id="startDate" date={startDate} setDate={setStartDate} className="w-full" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker id="endDate" date={endDate} setDate={setEndDate} className="w-full" />
                </div>
              </div>
              <div>
                <Label htmlFor="limit">Limit (max records)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleExportContacts} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export Contacts"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Export Appointments</CardTitle>
              <CardDescription>Export appointment data to CSV format for analysis or backup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker id="startDate" date={startDate} setDate={setStartDate} className="w-full" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker id="endDate" date={endDate} setDate={setEndDate} className="w-full" />
                </div>
              </div>
              <div>
                <Label htmlFor="limit">Limit (max records)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleExportAppointments} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export Appointments"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

