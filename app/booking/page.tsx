"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import CalendarSelector from "@/components/calendar-selector"

// Define the form schema using Zod
const formSchema = z.object({
  // Step 1: Service Selection
  serviceType: z.enum(["essential", "priority", "loan-signing", "reverse-mortgage", "specialty"]),
  numberOfSigners: z.coerce.number().min(1).max(10),

  // Step 2: Calendar Selection
  appointmentStartTime: z.string().optional(),
  appointmentEndTime: z.string().optional(),
  appointmentFormattedTime: z.string().optional(),

  // Step 3: Contact Information
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  company: z.string().optional(),

  // Step 4: Location Details
  address: z.string().min(5, { message: "Please enter a valid address" }),
  city: z.string().min(2, { message: "Please enter a valid city" }),
  state: z.string().min(2, { message: "Please enter a valid state" }),
  postalCode: z.string().min(5, { message: "Please enter a valid postal code" }),
  signingLocation: z.enum(["client-location", "public-place", "business-office"]),

  // Step 5: Additional Information
  specialInstructions: z.string().optional(),
  smsNotifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type FormData = z.infer<typeof formSchema>

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState({ lat: 0, lng: 0 })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "essential",
      numberOfSigners: 1,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      signingLocation: "client-location",
      specialInstructions: "",
      smsNotifications: true,
      emailUpdates: true,
      termsAccepted: false,
    },
  })

  const { formState, watch, setValue } = form
  const { errors, isValid } = formState

  const serviceType = watch("serviceType")
  const numberOfSigners = watch("numberOfSigners")
  const appointmentStartTime = watch("appointmentStartTime")
  const appointmentFormattedTime = watch("appointmentFormattedTime")

  const totalSteps = 6 // Increased by 1 for calendar selection

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const getServicePrice = () => {
    switch (serviceType) {
      case "essential":
        if (numberOfSigners === 1) return 75
        if (numberOfSigners === 2) return 85
        if (numberOfSigners === 3) return 95
        return 100 // 4+ signers
      case "priority":
        return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0)
      case "loan-signing":
      case "reverse-mortgage":
        return 150
      case "specialty":
        return 75
      default:
        return 75
    }
  }

  const getServiceName = () => {
    switch (serviceType) {
      case "essential":
        return "Essential Mobile Package"
      case "priority":
        return "Priority Service Package"
      case "loan-signing":
        return "Loan Signing Service"
      case "reverse-mortgage":
        return "Reverse Mortgage/HELOC"
      case "specialty":
        return "Specialty Service"
      default:
        return "Notary Service"
    }
  }

  // Function to handle calendar time selection
  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string) => {
    setValue("appointmentStartTime", startTime)
    setValue("appointmentEndTime", endTime)
    setValue("appointmentFormattedTime", formattedTime)
  }

  // Function to geocode the address
  const geocodeAddress = async (address: string, city: string, state: string, zip: string) => {
    try {
      const response = await fetch(
        `/api/geocode?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`,
      )

      if (!response.ok) {
        throw new Error("Geocoding request failed")
      }

      const data = await response.json()

      if (data.success && data.data) {
        const { lat, lng } = data.data
        setAddressCoordinates({ lat, lng })
        return { lat, lng }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Geocode the address
      const coordinates = await geocodeAddress(data.address, data.city, data.state, data.postalCode)

      // Prepare the data for submission
      const bookingData = {
        ...data,
        addressLatitude: coordinates?.lat.toString() || "",
        addressLongitude: coordinates?.lng.toString() || "",
      }

      // Create appointment in GHL calendar
      if (data.appointmentStartTime && data.appointmentEndTime) {
        const appointmentResponse = await fetch("/api/calendar/create-appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceType: data.serviceType,
            startTime: data.appointmentStartTime,
            endTime: data.appointmentEndTime,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            numberOfSigners: data.numberOfSigners,
            signingLocation: data.signingLocation,
            specialInstructions: data.specialInstructions,
            smsNotifications: data.smsNotifications,
            emailUpdates: data.emailUpdates,
          }),
        })

        const appointmentResult = await appointmentResponse.json()

        if (!appointmentResult.success) {
          throw new Error(appointmentResult.message || "Failed to create appointment")
        }

        // Store booking reference in localStorage for the confirmation page
        localStorage.setItem("bookingReference", appointmentResult.data.bookingReference)
        localStorage.setItem(
          "bookingDetails",
          JSON.stringify({
            serviceName: getServiceName(),
            servicePrice: getServicePrice(),
            numberOfSigners,
            appointmentDate: new Date(data.appointmentStartTime).toLocaleDateString(),
            appointmentTime: data.appointmentFormattedTime,
          }),
        )

        // Redirect to confirmation page
        router.push("/booking/confirmation")
      } else {
        throw new Error("No appointment time selected")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating your booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Book Your Notary Service</h1>
          <p className="text-gray-600">Complete the form below to schedule your mobile notary appointment.</p>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step > index + 1
                      ? "bg-[#A52A2A] text-white"
                      : step === index + 1
                        ? "bg-[#002147] text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-[#002147] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <div>Service</div>
              <div>Calendar</div>
              <div>Contact</div>
              <div>Location</div>
              <div>Details</div>
              <div>Confirm</div>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-md">
            {/* Step 1: Service Selection */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Select Your Service</CardTitle>
                  <CardDescription>Choose the type of notary service you need</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Service Type</Label>
                    <RadioGroup
                      defaultValue={serviceType}
                      onValueChange={(value) => setValue("serviceType", value as any)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="essential" id="essential" className="peer sr-only" />
                        <Label
                          htmlFor="essential"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Essential Mobile Package</span>
                          <span className="text-sm text-gray-500">Starting at $75</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="priority" id="priority" className="peer sr-only" />
                        <Label
                          htmlFor="priority"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Priority Service Package</span>
                          <span className="text-sm text-gray-500">$100 flat fee</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="loan-signing" id="loan-signing" className="peer sr-only" />
                        <Label
                          htmlFor="loan-signing"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Loan Signing Service</span>
                          <span className="text-sm text-gray-500">$150 flat fee</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="reverse-mortgage" id="reverse-mortgage" className="peer sr-only" />
                        <Label
                          htmlFor="reverse-mortgage"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Reverse Mortgage/HELOC</span>
                          <span className="text-sm text-gray-500">$150 flat fee</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="specialty" id="specialty" className="peer sr-only" />
                        <Label
                          htmlFor="specialty"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Specialty Services</span>
                          <span className="text-sm text-gray-500">Starting at $55</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.serviceType && <p className="text-sm text-red-500">{errors.serviceType.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfSigners">Number of Signers</Label>
                    <Select
                      defaultValue={numberOfSigners.toString()}
                      onValueChange={(value) => setValue("numberOfSigners", Number.parseInt(value))}
                    >
                      <SelectTrigger id="numberOfSigners">
                        <SelectValue placeholder="Select number of signers" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Signer" : "Signers"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.numberOfSigners && <p className="text-sm text-red-500">{errors.numberOfSigners.message}</p>}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Estimated Price:</h3>
                        <p className="text-sm text-gray-500">Based on service type and number of signers</p>
                      </div>
                      <div className="text-2xl font-bold text-[#002147]">${getServicePrice()}</div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Calendar Selection (New Step) */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Schedule Your Appointment</CardTitle>
                  <CardDescription>Select a date and time for your notary service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CalendarSelector serviceType={serviceType} onTimeSelected={handleTimeSelected} />

                  {appointmentStartTime && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <h3 className="font-semibold text-green-800">Appointment Selected</h3>
                      <p className="text-green-700">
                        {new Date(appointmentStartTime).toLocaleDateString()} at {appointmentFormattedTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 3: Contact Information (previously Step 2) */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Provide your contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" {...form.register("firstName")} placeholder="Enter your first name" />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" {...form.register("lastName")} placeholder="Enter your last name" />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="Enter your email address"
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" {...form.register("phone")} placeholder="Enter your phone number" />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name (Optional)</Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      placeholder="Enter your company name if applicable"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Location Details (previously Step 3) */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>Where will the notarization take place?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" {...form.register("address")} placeholder="Enter the street address" />
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...form.register("city")} placeholder="Enter the city" />
                      {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...form.register("state")} placeholder="Enter the state" />
                      {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" {...form.register("postalCode")} placeholder="Enter the postal code" />
                      {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Signing Location Type</Label>
                    <RadioGroup
                      defaultValue="client-location"
                      onValueChange={(value) => setValue("signingLocation", value as any)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="client-location" id="client-location" className="peer sr-only" />
                        <Label
                          htmlFor="client-location"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Residence</span>
                          <span className="text-sm text-gray-500">Home or apartment</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="business-office" id="business-office" className="peer sr-only" />
                        <Label
                          htmlFor="business-office"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Business Office</span>
                          <span className="text-sm text-gray-500">Office or workplace</span>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem value="public-place" id="public-place" className="peer sr-only" />
                        <Label
                          htmlFor="public-place"
                          className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                        >
                          <span className="font-semibold">Public Place</span>
                          <span className="text-sm text-gray-500">Café, library, etc.</span>
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.signingLocation && <p className="text-sm text-red-500">{errors.signingLocation.message}</p>}
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 5: Additional Information (previously Step 4) */}
            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>Provide any special instructions or requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      {...form.register("specialInstructions")}
                      placeholder="Enter any special instructions or additional information"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsNotifications"
                        checked={watch("smsNotifications")}
                        onCheckedChange={(checked) => setValue("smsNotifications", checked as boolean)}
                      />
                      <Label htmlFor="smsNotifications" className="text-sm">
                        I would like to receive SMS notifications about my appointment
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailUpdates"
                        checked={watch("emailUpdates")}
                        onCheckedChange={(checked) => setValue("emailUpdates", checked as boolean)}
                      />
                      <Label htmlFor="emailUpdates" className="text-sm">
                        I would like to receive email updates about my appointment
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 6: Confirmation (previously Step 5) */}
            {step === 6 && (
              <>
                <CardHeader>
                  <CardTitle>Confirm Your Booking</CardTitle>
                  <CardDescription>Review and confirm your appointment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{getServiceName()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Signers:</span>
                        <span className="font-medium">{numberOfSigners}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {appointmentStartTime ? new Date(appointmentStartTime).toLocaleDateString() : "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{appointmentFormattedTime || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">
                          {watch("address")}, {watch("city")}, {watch("state")} {watch("postalCode")}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-[#002147]">${getServicePrice()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termsAccepted"
                      checked={watch("termsAccepted")}
                      onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm">
                      I agree to the{" "}
                      <a href="/terms" className="text-[#002147] underline">
                        terms and conditions
                      </a>{" "}
                      and understand that a valid government-issued photo ID will be required for all signers
                    </Label>
                  </div>
                  {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>}
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !serviceType) ||
                    (step === 2 && !appointmentStartTime) ||
                    (step === 3 && (!watch("firstName") || !watch("lastName") || !watch("email") || !watch("phone"))) ||
                    (step === 4 && (!watch("address") || !watch("city") || !watch("state") || !watch("postalCode")))
                  }
                  className="ml-auto"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting || !appointmentStartTime}
                  className="ml-auto bg-[#A52A2A] hover:bg-[#8B0000]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Booking"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
