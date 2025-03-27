"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete } from "@/components/address-autocomplete"

export function PricingCalculator() {
  const [serviceType, setServiceType] = useState("essential")
  const [distance, setDistance] = useState(10)
  const [address, setAddress] = useState("")
  const [additionalSigners, setAdditionalSigners] = useState(0)
  const [additionalDocs, setAdditionalDocs] = useState(0)
  const [isWeekend, setIsWeekend] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [showManualDistance, setShowManualDistance] = useState(false)

  // Handle address selection
  const handleAddressSelected = (selectedAddress: string, calculatedDistance: number) => {
    setAddress(selectedAddress)
    setDistance(calculatedDistance)
  }

  // Calculate price whenever inputs change
  useEffect(() => {
    let basePrice = 0

    // Base price by service type
    switch (serviceType) {
      case "essential":
        basePrice = 75
        break
      case "priority":
        basePrice = 100
        break
      case "loan":
        basePrice = 150
        break
      case "reverse":
        basePrice = 150
        break
      case "specialty":
        basePrice = 125 // Default for specialty, would typically be custom
        break
    }

    // Add distance fee if beyond 20 miles
    const distanceFee = distance > 20 ? (distance - 20) * 1.5 : 0

    // Add additional signers fee (not for loan signing)
    const signersFee = serviceType !== "loan" && serviceType !== "reverse" ? additionalSigners * 10 : 0

    // Add additional documents fee (not for loan signing)
    const docsFee = serviceType !== "loan" && serviceType !== "reverse" ? additionalDocs * 5 : 0

    // Add weekend fee if applicable
    const weekendFee = isWeekend && serviceType !== "priority" ? 25 : 0

    // Calculate total
    const total = basePrice + distanceFee + signersFee + docsFee + weekendFee

    setTotalPrice(total)
  }, [serviceType, distance, additionalSigners, additionalDocs, isWeekend])

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Service Type</h3>
              <RadioGroup value={serviceType} onValueChange={setServiceType} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="essential" id="essential" className="text-primary" />
                  <Label htmlFor="essential">Essential Mobile Package ($75)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="priority" id="priority" className="text-primary" />
                  <Label htmlFor="priority">Priority Service ($100)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loan" id="loan" className="text-primary" />
                  <Label htmlFor="loan">Loan Signing ($150)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reverse" id="reverse" className="text-primary" />
                  <Label htmlFor="reverse">Reverse Mortgage/HELOC ($150)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specialty" id="specialty" className="text-primary" />
                  <Label htmlFor="specialty">Specialty Services (Varies)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Location</h3>
              <AddressAutocomplete
                onAddressSelected={handleAddressSelected}
                label="Enter your address"
                placeholder="Type your address for distance calculation"
              />

              {address && (
                <div className="text-sm text-muted-foreground">
                  <p>Selected address: {address}</p>
                  <p>Distance: {distance.toFixed(1)} miles from our location</p>
                </div>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={showManualDistance}
                  onCheckedChange={setShowManualDistance}
                  className="data-[state=checked]:bg-primary"
                />
                <Label>Manually adjust distance</Label>
              </div>

              {showManualDistance && (
                <div className="space-y-2 mt-2">
                  <Slider
                    value={[distance]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(value) => setDistance(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 mile</span>
                    <span>{distance.toFixed(1)} miles</span>
                    <span>50 miles</span>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {distance > 20
                  ? `Additional travel fee: $${((distance - 20) * 1.5).toFixed(2)}`
                  : "No additional travel fee (within 20 miles)"}
              </p>
            </div>

            {(serviceType === "essential" || serviceType === "priority" || serviceType === "specialty") && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Signers</h3>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={additionalSigners}
                      onChange={(e) => setAdditionalSigners(Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">$10 per additional signer beyond 2</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Documents</h3>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={additionalDocs}
                      onChange={(e) => setAdditionalDocs(Number.parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">$5 per additional document beyond 2</span>
                  </div>
                </div>
              </>
            )}

            {serviceType !== "priority" && (
              <div>
                <h3 className="text-lg font-medium mb-4">Weekend Appointment</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isWeekend}
                    onCheckedChange={setIsWeekend}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label>Weekend appointment (+$25)</Label>
                </div>
              </div>
            )}
          </div>

          <div className="bg-secondary/10 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-accent mb-6">Estimated Price</h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">
                  $
                  {serviceType === "essential"
                    ? "75"
                    : serviceType === "priority"
                      ? "100"
                      : serviceType === "loan"
                        ? "150"
                        : serviceType === "reverse"
                          ? "150"
                          : "125"}
                </span>
              </div>

              {distance > 20 && (
                <div className="flex justify-between">
                  <span>Travel Fee:</span>
                  <span className="font-medium">${((distance - 20) * 1.5).toFixed(2)}</span>
                </div>
              )}

              {additionalSigners > 0 &&
                (serviceType === "essential" || serviceType === "priority" || serviceType === "specialty") && (
                  <div className="flex justify-between">
                    <span>Additional Signers:</span>
                    <span className="font-medium">${additionalSigners * 10}</span>
                  </div>
                )}

              {additionalDocs > 0 &&
                (serviceType === "essential" || serviceType === "priority" || serviceType === "specialty") && (
                  <div className="flex justify-between">
                    <span>Additional Documents:</span>
                    <span className="font-medium">${additionalDocs * 5}</span>
                  </div>
                )}

              {isWeekend && serviceType !== "priority" && (
                <div className="flex justify-between">
                  <span>Weekend Fee:</span>
                  <span className="font-medium">$25</span>
                </div>
              )}

              <div className="border-t pt-4 mt-4 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">What's included:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {serviceType === "essential" && (
                    <>
                      <li>Mobile notary service at your location</li>
                      <li>Up to 2 signers included</li>
                      <li>Up to 2 documents included</li>
                      <li>Available Monday-Friday, 9am-5pm</li>
                    </>
                  )}
                  {serviceType === "priority" && (
                    <>
                      <li>2-hour response time</li>
                      <li>Extended hours (7am-9pm daily)</li>
                      <li>Up to 5 documents included</li>
                      <li>Weekend service included</li>
                      <li>SMS status updates</li>
                    </>
                  )}
                  {serviceType === "loan" && (
                    <>
                      <li>Unlimited documents</li>
                      <li>Up to 4 signers included</li>
                      <li>Color printing service</li>
                      <li>Professional closing binder</li>
                      <li>90-minute signing session</li>
                    </>
                  )}
                  {serviceType === "reverse" && (
                    <>
                      <li>4-hour response window</li>
                      <li>Certified mail return</li>
                      <li>Dual agent coordination</li>
                      <li>Unlimited documents</li>
                      <li>In-depth explanation of forms</li>
                    </>
                  )}
                  {serviceType === "specialty" && (
                    <>
                      <li>Specialized document handling</li>
                      <li>Custom service options</li>
                      <li>Priority scheduling</li>
                      <li>Expert assistance</li>
                    </>
                  )}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                This is an estimate. Final pricing may vary based on specific requirements. Contact us for a precise
                quote for your situation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

