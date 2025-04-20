"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format, startOfMonth, endOfMonth, parseISO, eachDayOfInterval, addDays, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2, CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Define the form schema using Zod
const formSchema = z.object({
  // Step 1: Service Selection
  serviceType: z.enum(["essential", "priority", "loan-signing", "reverse-mortgage", "specialty"]),
  numberOfSigners: z.coerce.number().min(1).max(10),

  // Step 2: Calendar Selection
  appointmentDate: z.string().optional(),
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

// Define TimeSlot interface
interface TimeSlot {
  startTime: string
  endTime: string
}

export default function BookingPageClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState({ lat: 0, lng: 0 })

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const [timeError, setTimeError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "essential",
      numberOfSigners: 1,
      appointmentDate: undefined,
      appointmentStartTime: undefined,
      appointmentEndTime: undefined,
      appointmentFormattedTime: undefined,
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

  const { formState, watch, setValue, register } = form
  const { errors, isValid } = formState

  const serviceType = watch("serviceType")
  const numberOfSigners = watch("numberOfSigners")
  const appointmentDate = watch("appointmentDate")
  const appointmentStartTime = watch("appointmentStartTime")
  const appointmentFormattedTime = watch("appointmentFormattedTime")

  const totalSteps = 6

  const getDuration = () => {
    switch (serviceType) {
      case "loan-signing":
      case "reverse-mortgage":
        return 90
      case "priority":
        return 60
      default:
        return 30
    }
  }

  useEffect(() => {
    if (!serviceType) return

    const fetchAvailableDates = async () => {
      setIsLoadingDates(true)
      setDateError(null)
      setAvailableDates([])
      setSelectedDate(undefined)
      setAvailableTimeSlots([])
      setSelectedTimeSlot(null)

      try {
        const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd")
        const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd")
        const duration = getDuration()
        const timezone = "America/Chicago"

        const response = await fetch(
          `/api/calendar/available-slots?serviceType=${serviceType}&startDate=${monthStart}&endDate=${monthEnd}&duration=${duration}&timezone=${timezone}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch available dates")
        }

        const data = await response.json()
        console.log("Available Dates Response:", data)

        if (data.success && data.data && Array.isArray(data.data.availableDates)) {
          setAvailableDates(data.data.availableDates)
        } else {
          setAvailableDates([])
          if (!data.success) {
            throw new Error(data.message || "Failed to retrieve available dates")
          }
        }
      } catch (error) {
        console.error("Error fetching available dates:", error)
        setDateError(error instanceof Error ? error.message : "Could not load available dates. Please try refreshing.")
      } finally {
        setIsLoadingDates(false)
      }
    }

    fetchAvailableDates()
  }, [serviceType, currentMonth])

  useEffect(() => {
    if (!selectedDate || !serviceType) {
      setAvailableTimeSlots([])
      setSelectedTimeSlot(null)
      return
    }

    const fetchTimeSlots = async () => {
      setIsLoadingTimes(true)
      setTimeError(null)
      setAvailableTimeSlots([])
      setSelectedTimeSlot(null)

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const duration = getDuration()
        const timezone = "America/Chicago"

        const response = await fetch(
          `/api/calendar/time-slots?serviceType=${serviceType}&date=${dateStr}&duration=${duration}&timezone=${timezone}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch time slots")
        }

        const data = await response.json()
        console.log("Available Times Response:", data)

        if (data.success && data.data && Array.isArray(data.data.slots)) {
          const formattedSlots = data.data.slots.map((slot: TimeSlot) => {
            const start = parseISO(slot.startTime)
            return {
              ...slot,
              formattedTime: format(start, "h:mm a"),
            }
          })
          setAvailableTimeSlots(formattedSlots)
        } else {
          setAvailableTimeSlots([])
          if (!data.success) {
            throw new Error(data.message || "Failed to retrieve time slots")
          }
        }
      } catch (error) {
        console.error("Error fetching time slots:", error)
        setTimeError(error instanceof Error ? error.message : "Could not load time slots for this date.")
      } finally {
        setIsLoadingTimes(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDate, serviceType])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      return
    }
    const dateStr = format(date, "yyyy-MM-dd")
    if (availableDates.includes(dateStr)) {
      setSelectedDate(date)
      setValue("appointmentDate", dateStr)
    } else {
      toast({ title: "Date Not Available", description: "Please select a highlighted date." })
    }
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot & { formattedTime: string }) => {
    setSelectedTimeSlot(timeSlot)
    setValue("appointmentStartTime", timeSlot.startTime)
    setValue("appointmentEndTime", timeSlot.endTime)
    setValue("appointmentFormattedTime", timeSlot.formattedTime)
  }

  const nextStep = () => {
    if (step === 2 && !selectedTimeSlot) {
      toast({ title: "Selection Required", description: "Please select an available date and time slot.", variant: "destructive" })
      return
    }
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
        return 100
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
      const coordinates = await geocodeAddress(data.address, data.city, data.state, data.postalCode)

      const bookingData = {
        ...data,
        addressLatitude: coordinates?.lat.toString() || "",
        addressLongitude: coordinates?.lng.toString() || "",
      }

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

        localStorage.setItem("bookingReference", appointmentResult.data.bookingReference)
        localStorage.setItem(
          "bookingDetails",
          JSON.stringify({
            serviceName: getServiceName(),
            servicePrice: getServicePrice(),
            numberOfSigners,
            appointmentDate: format(parseISO(data.appointmentStartTime), "PPP"),
            appointmentTime: data.appointmentFormattedTime,
          }),
        )

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

  const today = startOfDay(new Date())
  const availableDateObjects = availableDates.map(dateStr => parseISO(dateStr))

  const modifiers = {
    available: availableDateObjects,
    selected: selectedDate,
    today: today,
  }
  const modifiersStyles = {
    available: {
      fontWeight: 'bold',
    },
    selected: {
      backgroundColor: '#002147',
      color: 'white',
    },
  }

  const disabledDays = [
    { before: today },
    (date: Date) => !availableDates.includes(format(date, 'yyyy-MM-dd'))
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Book Your Notary Service</h1>
          <p className="text-gray-600">Complete the form below to schedule your mobile notary appointment.</p>

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

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Schedule Your Appointment</CardTitle>
                  <CardDescription>Select an available date and time slot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">1. Select Date</h3>
                    {isLoadingDates ? (
                      <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#002147]" /></div>
                    ) : dateError ? (
                      <p className="text-red-500">{dateError}</p>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        disabled={disabledDays}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        initialFocus
                        className="rounded-md border"
                        fromMonth={new Date()}
                        toMonth={addDays(new Date(), 365)}
                      />
                    )}
                    {!isLoadingDates && availableDates.length === 0 && !dateError && (
                      <p className="mt-2 text-yellow-600">No available dates found for this service in the current month.</p>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">2. Select Time Slot for {format(selectedDate, "PPP")}</h3>
                      {isLoadingTimes ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#002147]" /></div>
                      ) : timeError ? (
                        <p className="text-red-500">{timeError}</p>
                      ) : availableTimeSlots.length === 0 ? (
                        <p className="text-yellow-600">No available time slots found for this date.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {availableTimeSlots.map((timeSlot, index) => (
                            <Button
                              key={index}
                              variant={selectedTimeSlot?.startTime === timeSlot.startTime ? "default" : "outline"}
                              className={cn(
                                "flex items-center justify-center",
                                selectedTimeSlot?.startTime === timeSlot.startTime
                                  ? "bg-[#002147] hover:bg-[#001a38]"
                                  : "hover:bg-gray-100",
                              )}
                              onClick={() => handleTimeSlotSelect(timeSlot as TimeSlot & { formattedTime: string })}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {(timeSlot as TimeSlot & { formattedTime: string }).formattedTime}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTimeSlot && (
                    <div className="bg-green-50 p-4 rounded-md mt-4">
                      <h3 className="font-semibold text-green-800">Appointment Selected</h3>
                      <p className="text-green-700">
                        {format(selectedDate!, "PPP")} at {selectedTimeSlot.formattedTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            )}

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
                      <Input id="firstName" {...register("firstName")} placeholder="Enter your first name" />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" {...register("lastName")} placeholder="Enter your last name" />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="Enter your email address"
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" {...register("phone")} placeholder="Enter your phone number" />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name (Optional)</Label>
                    <Input
                      id="company"
                      {...register("company")}
                      placeholder="Enter your company name if applicable"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>Where will the notarization take place?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" {...register("address")} placeholder="Enter the street address" />
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register("city")} placeholder="Enter the city" />
                      {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...register("state")} placeholder="Enter the state" />
                      {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" {...register("postalCode")} placeholder="Enter the postal code" />
                      {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Signing Location</Label>
                    <RadioGroup
                      defaultValue={watch("signingLocation")}
                      onValueChange={(value) => setValue("signingLocation", value as any)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="client-location" id="client-location" />
                        <Label htmlFor="client-location">Client's Location (Home/Office)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public-place" id="public-place" />
                        <Label htmlFor="public-place">Public Place (Cafe, Library, etc.)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="business-office" id="business-office" />
                        <Label htmlFor="business-office">Our Business Office</Label>
                      </div>
                    </RadioGroup>
                    {errors.signingLocation && <p className="text-sm text-red-500">{errors.signingLocation.message}</p>}
                  </div>
                </CardContent>
              </>
            )}

            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Any other details we should know?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="specialInstructions"
                      {...register("specialInstructions")}
                      placeholder="E.g., Gate code, specific meeting spot, documents involved"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="smsNotifications" defaultChecked={watch("smsNotifications")} onCheckedChange={(checked) => setValue("smsNotifications", Boolean(checked))} />
                      <Label htmlFor="smsNotifications">Receive SMS appointment reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="emailUpdates" defaultChecked={watch("emailUpdates")} onCheckedChange={(checked) => setValue("emailUpdates", Boolean(checked))} />
                      <Label htmlFor="emailUpdates">Receive email updates and confirmations</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="termsAccepted" onCheckedChange={(checked) => setValue("termsAccepted", Boolean(checked))} />
                    <Label htmlFor="termsAccepted">I accept the terms and conditions</Label>
                    {errors.termsAccepted && <p className="text-sm text-red-500 ml-4">{errors.termsAccepted.message}</p>}
                  </div>
                </CardContent>
              </>
            )}

            {step === 6 && (
              <>
                <CardHeader>
                  <CardTitle>Confirm Your Booking</CardTitle>
                  <CardDescription>Review your details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><span className="font-semibold">Service:</span> {getServiceName()}</div>
                  <div className="space-y-2"><span className="font-semibold">Signers:</span> {numberOfSigners}</div>
                  <div className="space-y-2"><span className="font-semibold">Date:</span> {format(selectedDate!, "PPP")}</div>
                  <div className="space-y-2"><span className="font-semibold">Time:</span> {selectedTimeSlot?.formattedTime}</div>
                  <div className="space-y-2"><span className="font-semibold">Contact:</span> {watch("firstName")} {watch("lastName")}, {watch("email")}, {watch("phone")}</div>
                  <div className="space-y-2"><span className="font-semibold">Location:</span> {watch("address")}, {watch("city")}, {watch("state")} {watch("postalCode")}</div>
                  <div className="space-y-2"><span className="font-semibold">Estimated Price:</span> ${getServicePrice()}</div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} disabled={(step === 2 && !selectedTimeSlot)}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Booking"
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
