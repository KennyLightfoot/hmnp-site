"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import AppointmentCalendar from "@/components/appointment-calendar"
import Link from "next/link"

// Define the form schema using Zod
const formSchema = z.object({
  // Step 1: Service Selection
  serviceType: z.enum(["essential", "priority", "loan-signing", "reverse-mortgage", "specialty"]),
  numberOfSigners: z.coerce.number().min(1).max(10),

  // Step 2: Calendar Selection
  calendarId: z.string().min(1, { message: "Internal error: Calendar ID missing" }),
  appointmentStartTime: z.string().min(1, { message: "Please select an appointment time" }),
  appointmentEndTime: z.string().min(1, { message: "Internal error: End time missing" }),
  appointmentFormattedTime: z.string().min(1, { message: "Internal error: Formatted time missing" }),

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
  smsNotifications: z.boolean(),
  emailUpdates: z.boolean(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type FormData = z.infer<typeof formSchema>

// Define valid service types for props (matching the calendar component)
type ServiceType = "essential" | "priority" | "loan-signing" | "reverse-mortgage" | "specialty";

export default function BookingPageClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState({ lat: 0, lng: 0 })

  // Refs for step titles
  const stepRefs = {
    1: useRef<HTMLHeadingElement>(null),
    2: useRef<HTMLHeadingElement>(null),
    3: useRef<HTMLHeadingElement>(null),
    4: useRef<HTMLHeadingElement>(null),
    5: useRef<HTMLHeadingElement>(null),
    6: useRef<HTMLHeadingElement>(null),
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: "essential",
      numberOfSigners: 1,
      calendarId: "",
      appointmentStartTime: "",
      appointmentEndTime: "",
      appointmentFormattedTime: "",
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

  const serviceType = watch("serviceType") as ServiceType
  const numberOfSigners = watch("numberOfSigners")
  const appointmentStartTime = watch("appointmentStartTime")
  const appointmentFormattedTime = watch("appointmentFormattedTime")

  const totalSteps = 6

  // Focus the step title when the step changes
  useEffect(() => {
    const currentStepRef = stepRefs[step as keyof typeof stepRefs];
    if (currentStepRef.current) {
      // Use setTimeout to ensure the element is visible before focusing
      setTimeout(() => {
        currentStepRef.current?.focus();
      }, 0);
    }
    window.scrollTo(0, 0); // Keep scroll to top
  }, [step]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      // Focus handled by useEffect
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      // Focus handled by useEffect
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

  // Updated handleTimeSelected to accept calendarId
  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string, calendarId: string) => {
    setValue("appointmentStartTime", startTime)
    setValue("appointmentEndTime", endTime)
    setValue("appointmentFormattedTime", formattedTime)
    setValue("calendarId", calendarId); // Set the calendarId in the form state
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
      // Show toast notification to the user
      toast({
        title: "Address Verification Failed",
        description: "Could not verify the provided address. Please double-check the details and try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Geocode the address
      const coordinates = await geocodeAddress(data.address, data.city, data.state, data.postalCode)

      // Prepare the data specifically for the API endpoint
      const apiPayload = {
        calendarId: data.calendarId,
        startTime: data.appointmentStartTime,
        endTime: data.appointmentEndTime,
        // Send firstName and lastName separately as expected by the API
        firstName: data.firstName, 
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        // Include other relevant fields from 'data'
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        signingLocation: data.signingLocation,
        specialInstructions: data.specialInstructions,
        // Pass coordinates if available
        addressLatitude: coordinates?.lat.toString() || "",
        addressLongitude: coordinates?.lng.toString() || "",
        // Add any other necessary fields based on the API documentation
        serviceType: data.serviceType,
        numberOfSigners: data.numberOfSigners,
        smsNotifications: data.smsNotifications,
        emailUpdates: data.emailUpdates,
        // We don't need to send termsAccepted to the GHL API
      };

      // Create appointment in GHL calendar
      if (apiPayload.startTime && apiPayload.endTime) { // Check renamed fields
        const appointmentResponse = await fetch("/api/calendar/create-appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send the formatted apiPayload
          body: JSON.stringify(apiPayload),
        })

        const appointmentResult = await appointmentResponse.json()

        if (!appointmentResult.success) {
          throw new Error(appointmentResult.message || "Failed to create appointment")
        }

        // Store booking reference in localStorage for the confirmation page
        // Use original form data 'data' or watched values for storing details if needed
        localStorage.setItem("bookingReference", appointmentResult.data.bookingReference)
        localStorage.setItem(
          "bookingDetails",
          JSON.stringify({
            serviceName: getServiceName(),
            servicePrice: getServicePrice(),
            numberOfSigners: data.numberOfSigners, // Use original data
            appointmentDate: new Date(data.appointmentStartTime).toLocaleDateString(), // Use original data
            appointmentTime: data.appointmentFormattedTime, // Use original data
          }),
        )

        // Redirect to confirmation page
        router.push("/booking/confirmation")
      } else {
        throw new Error("No appointment time selected")
      }
    } catch (error) {
      console.error("Submission error:", error)

      let errorMessage = "An error occurred while creating your booking. Please try again later."
      if (error instanceof Error) {
        // Check for specific error messages
        if (error.message.includes("Failed to create appointment")) {
          errorMessage = "Could not schedule the appointment in the calendar. Please try selecting a different time or contact support."
        } else if (error.message.includes("No appointment time selected")) {
          errorMessage = "No appointment time was selected. Please go back to the calendar step and choose a time slot."
        } else if (error.message.includes("geocode") || error.message.includes("Geocoding")) {
          errorMessage = "Could not verify the provided address. Please go back and check the location details."
        } else {
          // Use the caught error message if it's somewhat specific, otherwise use the default
          errorMessage = error.message || errorMessage;
        }
      }

      toast({
        title: "Booking Error",
        description: errorMessage,
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
          <p className="text-sm text-gray-500 mt-2">
            New to our services? Learn about{" "}
            <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
              what to expect during your appointment
            </Link>{" "}
            to ensure a smooth process.
          </p>

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

        {/* Wrap form content with shadcn/ui Form component */}
        <Form {...form}> 
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-md">
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[1]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Select Your Service
                    </CardTitle>
                    <CardDescription>Choose the type of notary service you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Service Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <FormItem className="relative">
                                <FormControl>
                                  <RadioGroupItem value="essential" id="essential" className="peer sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor="essential"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                                >
                                  <span className="font-semibold">Essential Mobile Package</span>
                                  <span className="text-sm text-gray-500">Starting at $75</span>
                                </Label>
                              </FormItem>
                              <FormItem className="relative">
                                <FormControl>
                                  <RadioGroupItem value="priority" id="priority" className="peer sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor="priority"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                                >
                                  <span className="font-semibold">Priority Service Package</span>
                                  <span className="text-sm text-gray-500">$100 flat fee</span>
                                </Label>
                              </FormItem>
                              <FormItem className="relative">
                                <FormControl>
                                  <RadioGroupItem value="loan-signing" id="loan-signing" className="peer sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor="loan-signing"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                                >
                                  <span className="font-semibold">Loan Signing Service</span>
                                  <span className="text-sm text-gray-500">$150 flat fee</span>
                                </Label>
                              </FormItem>
                              <FormItem className="relative">
                                <FormControl>
                                  <RadioGroupItem value="reverse-mortgage" id="reverse-mortgage" className="peer sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor="reverse-mortgage"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                                >
                                  <span className="font-semibold">Reverse Mortgage/HELOC</span>
                                  <span className="text-sm text-gray-500">$150 flat fee</span>
                                </Label>
                              </FormItem>
                              <FormItem className="relative">
                                <FormControl>
                                  <RadioGroupItem value="specialty" id="specialty" className="peer sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor="specialty"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5"
                                >
                                  <span className="font-semibold">Specialty Services</span>
                                  <span className="text-sm text-gray-500">Starting at $55</span>
                                </Label>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numberOfSigners"
                      render={({ field }) => {
                        // Extract onChange to potentially help type inference
                        const handleValueChange = (value: string) => {
                            field.onChange(Number.parseInt(value));
                        };
                        
                        return (
                          <FormItem className="space-y-2">
                            <FormLabel htmlFor="numberOfSigners">Number of Signers</FormLabel>
                            <Select
                              onValueChange={handleValueChange} // Use the extracted handler
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger id="numberOfSigners">
                                  <SelectValue placeholder="Select number of signers" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? "Signer" : "Signers"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

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

              {/* Step 2: Calendar Selection */}
              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[2]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Schedule Your Appointment
                    </CardTitle>
                    <CardDescription>Select an available date and time slot</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AppointmentCalendar 
                      serviceType={serviceType} 
                      numberOfSigners={numberOfSigners}
                      onTimeSelected={handleTimeSelected}
                    />

                    {appointmentStartTime && (
                      <div className="bg-green-50 p-4 rounded-md mt-4">
                        <h3 className="font-semibold text-green-800">Time Slot Selected</h3>
                        <p className="text-green-700">
                          {appointmentFormattedTime || "Error displaying time"}
                        </p>
                      </div>
                    )}
                    {errors.appointmentStartTime && <p className="text-sm text-red-500 mt-2">Please select a time slot.</p>}
                  </CardContent>
                </>
              )}

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[3]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Contact Information
                    </CardTitle>
                    <CardDescription>Provide your contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your company name if applicable" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </>
              )}

              {/* Step 4: Location Details */}
              {step === 4 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[4]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Location Details
                    </CardTitle>
                    <CardDescription>Where will the notarization take place?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="signingLocation"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Signing Location Type</FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </>
              )}

              {/* Step 5: Additional Information */}
              {step === 5 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[5]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Additional Details
                    </CardTitle>
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
                          onCheckedChange={(checked: boolean) => setValue("smsNotifications", checked)}
                        />
                        <Label htmlFor="smsNotifications" className="text-sm">
                          I would like to receive SMS notifications about my appointment
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailUpdates"
                          checked={watch("emailUpdates")}
                          onCheckedChange={(checked: boolean) => setValue("emailUpdates", checked)}
                        />
                        <Label htmlFor="emailUpdates" className="text-sm">
                          I would like to receive email updates about my appointment
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 6: Confirmation */}
              {step === 6 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[6]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Confirm Your Booking
                    </CardTitle>
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

                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{" "}
                              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#002147] underline hover:text-[#A52A2A]">
                                terms and conditions
                              </a>{" "}
                              and understand that a valid government-issued photo ID will be required for all signers.
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    {errors.termsAccepted && <p className="text-sm text-red-500 pt-2">{errors.termsAccepted.message}</p>}
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
                    disabled={!!(
                      (step === 1 && (!serviceType || errors.numberOfSigners)) ||
                      (step === 2 && !appointmentStartTime) ||
                      (step === 3 && (errors.firstName || errors.lastName || errors.email || errors.phone)) ||
                      (step === 4 && (errors.address || errors.city || errors.state || errors.postalCode || errors.signingLocation))
                    )}
                    className="ml-auto"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || isSubmitting}
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
        </Form>
      </div>
    </div>
  )
}
