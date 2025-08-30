"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BookingData } from "./booking-form"

interface CustomerDetailsProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

export function CustomerDetails({ bookingData, updateBookingData }: CustomerDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              value={bookingData.customerName}
              onChange={(e) => updateBookingData({ customerName: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={bookingData.customerPhone}
              onChange={(e) => updateBookingData({ customerPhone: e.target.value })}
              placeholder="(713) 555-0123"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="customerEmail">Email Address *</Label>
          <Input
            id="customerEmail"
            type="email"
            value={bookingData.customerEmail}
            onChange={(e) => updateBookingData({ customerEmail: e.target.value })}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numberOfSigners">Number of Signers</Label>
            <Select
              value={bookingData.numberOfSigners.toString()}
              onValueChange={(value) => updateBookingData({ numberOfSigners: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Signer" : "Signers"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="numberOfDocuments">Number of Documents</Label>
            <Select
              value={bookingData.numberOfDocuments.toString()}
              onValueChange={(value) => updateBookingData({ numberOfDocuments: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Document" : "Documents"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
          <Textarea
            id="specialInstructions"
            value={bookingData.specialInstructions || ""}
            onChange={(e) => updateBookingData({ specialInstructions: e.target.value })}
            placeholder="Any special requirements or notes for your appointment..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
