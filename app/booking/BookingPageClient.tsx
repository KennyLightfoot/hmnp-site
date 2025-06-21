"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { ChevronLeft, ChevronRight, Loader2, Sparkles, AlertTriangle } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LocationType } from "@prisma/client"
import { FrontendServiceType, isValidFrontendServiceType } from "@/lib/types/service-types"

// Define the form schema using Zod
const formSchema = z.object({
  // Step 1: Service Selection
  serviceType: z.string().min(1, { message: "Please select a service type" }),
promoCode: z.string().optional(), // Added for promo code
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

interface ApiService {
  id: string;
  key: string; // Should match values in serviceType enum e.g., "essential", "loan-signing"
  name: string; // For display name
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount: number | null;
  // Add other relevant fields from your Service model in Prisma if needed for display
}



export default function BookingPageClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState({ lat: 0, lng: 0 });
  const [serviceIdMapFromAPI, setServiceIdMapFromAPI] = useState<Record<string, string>>({});
  const [fetchedServicesList, setFetchedServicesList] = useState<ApiService[]>([]); // To store full service details
  const [servicesLoadingError, setServicesLoadingError] = useState<string | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ApiService | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoadingError(null); // Clear previous error on new attempt
        const response = await fetch('/api/services');
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Could not retrieve error details.');
          console.error('Failed to fetch services response:', response.status, errorText);
          throw new Error(`Failed to fetch services: ${response.status}. ${errorText.substring(0, 150)}`);
        }
        const services: ApiService[] = await response.json();
        console.log('!!!!!!!!!! Fetched services from /api/services:', JSON.stringify(services, null, 2)); // DETAILED LOGGING
        if (!Array.isArray(services)) {
          console.error('Fetched services is not an array:', services);
          throw new Error('Invalid format for services data received from server.');
        }
        const newMap: Record<string, string> = {};
        services.forEach(service => {
          if (service.key && service.id) {
            newMap[service.key] = service.id;
          }
        });
        setServiceIdMapFromAPI(newMap);
        setFetchedServicesList(services); // Store the full list
        if (Object.keys(newMap).length === 0 && services.length > 0) {
            console.warn('Service map is empty but services were fetched. Check service keys against form serviceType enum.');
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching services.";
        setServicesLoadingError(errorMessage);
        toast({
          title: "Error Loading Service Options",
          description: "Could not load service types. Please try refreshing. If the problem persists, contact support.",
          variant: "destructive",
          duration: 10000, // Keep toast longer
        });
      }
    };

    fetchServices();
  }, []); // Empty dependency array ensures this runs once on mount

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
      promoCode: "",
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

  const serviceType = watch("serviceType")
  const numberOfSigners = watch("numberOfSigners")
  const appointmentStartTime = watch("appointmentStartTime")
  const appointmentFormattedTime = watch("appointmentFormattedTime")

  // Effect to update selectedServiceDetail when serviceType or fetchedServicesList changes
  useEffect(() => {
    if (serviceType && fetchedServicesList.length > 0) {
      const detail = fetchedServicesList.find(s => s.key === serviceType) || null;
      setSelectedServiceDetail(detail);
    }
  }, [serviceType, fetchedServicesList]);

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

  // Function to validate and map service types
  const mapServiceTypeForCalendar = (serviceType: string): FrontendServiceType => {
    if (isValidFrontendServiceType(serviceType)) {
      return serviceType;
    }
    console.warn(`Invalid service type: ${serviceType}, defaulting to essential`);
    return "essential"; // Safe fallback
  };

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
    setIsSubmitting(true);
    console.log("Form data for /api/bookings:", data);

    // Service ID is now fetched dynamically from /api/services and stored in serviceIdMapFromAPI.
    const serviceId = serviceIdMapFromAPI[data.serviceType as keyof typeof serviceIdMapFromAPI];

    if (!serviceId) {
      console.error("Could not determine serviceId for serviceType:", data.serviceType, "Available map:", serviceIdMapFromAPI);
      toast({
        title: "Booking Failed",
        description: servicesLoadingError || "Invalid service type selected or service ID mapping missing. This could be due to a problem loading service options. Please refresh and try again, or contact support if the issue persists.",
        variant: "destructive",
        duration: 10000,
      });
      setIsSubmitting(false);
      return;
    }

    // Map signingLocation to LocationType enum expected by backend
    let locationTypeApi: string | undefined = undefined;
    switch (data.signingLocation) {
      case "client-location":
        locationTypeApi = "CLIENT_SPECIFIED_ADDRESS"; // Updated to match Prisma enum
        break;
      case "public-place":
        locationTypeApi = "PUBLIC_PLACE"; // Updated to match Prisma enum
        break;
      case "business-office": // Assuming this means a generic business office, maps to OUR_OFFICE
        locationTypeApi = "OUR_OFFICE"; // Updated to match Prisma enum (assuming 'business-office' means HMNP's office)
        break;
      default:
        console.warn("Unknown signing location:", data.signingLocation);
        // Optionally set a default or handle as an error. 
        // Consider throwing an error or setting a default that the backend will reject if unmapped.
        toast({
          title: "Invalid Location",
          description: `The selected signing location '${data.signingLocation}' is not recognized. Please select a valid option.`,
          variant: "destructive",
          duration: 7000,
        });
        setIsSubmitting(false);
        return; // Prevent submission with an undefined or unmapped locationTypeApi
    }

    const apiPayload = {
      serviceId: serviceId,
      scheduledDateTime: data.appointmentStartTime, // Ensure this is an ISO string
      locationType: locationTypeApi,
      addressStreet: data.address,
      addressCity: data.city,
      addressState: data.state,
      addressZip: data.postalCode,
      // locationNotes: data.locationNotes, // TODO: Add locationNotes to form if needed by backend/GHL
      notes: data.specialInstructions, // This will map to cf_booking_special_instructions in the backend
      // promoCode: data.promoCode, // TODO: Add promoCode field to the form
      // referredBy: data.referredBy, // TODO: Add referredBy field to the form
      booking_number_of_signers: data.numberOfSigners,
      consent_terms_conditions: data.termsAccepted,
      // Client details for GHL upsertion. Backend uses session for Booking's signerId.
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company, // Optional, but pass if collected
      consentSms: data.smsNotifications, // Added for SMS consent
      consentEmail: data.emailUpdates, // Added for Email consent
    };

    console.log("Submitting to /api/bookings with payload:", JSON.stringify(apiPayload, null, 2));

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();
      console.log("/api/bookings Response:", result);

      if (!response.ok) {
        // Use error message from backend if available, otherwise a generic one
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      // Handle response from /api/bookings
      if (result.booking && result.booking.id) {
        if (result.payment && result.payment.clientSecret && result.payment.paymentIntentId && result.payment.amount) {
          // Payment is required, redirect to a checkout page
          toast({
            title: "Payment Required",
            description: "Redirecting to secure payment...",
            variant: "default",
          });
          router.push(`/checkout?bookingId=${result.booking.id}&paymentIntentId=${result.payment.paymentIntentId}&clientSecret=${result.payment.clientSecret}&amount=${result.payment.amount}`);
        } else {
          // No payment required at this step, or payment handled differently (e.g., pay on arrival)
          // Navigate to a booking confirmation page
          toast({
            title: "Booking Confirmed!", // Or "Booking Request Received!" if further steps are needed
            description: `Thank you, ${data.firstName}! Your booking for ${getServiceName()} has been processed.`,
            variant: "default", // Changed from 'success' to 'default'
          });
          // TODO: Decide if GHL calendar booking should be triggered here or by the backend.
          // For now, navigating directly to confirmation.
          router.push(`/booking-confirmation?bookingId=${result.booking.id}`);
        }
      } else {
        // Should not happen if response.ok is true and backend behaves as expected
        console.error("Booking successful but booking ID missing in response:", result);
        throw new Error("Booking processed but encountered an issue retrieving booking details. Please contact support.");
      }

    } catch (error) {
      console.error("Error submitting booking to /api/bookings:", error);
      toast({
        title: "Booking Submission Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please check your details and try again. If the problem persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* BEGIN: Promotional Alert */}
        <Alert className="mb-6 border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
          <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="font-semibold text-green-800 dark:text-green-200">Unlock Your Discounts!</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc space-y-1 pl-5 mt-1">
              <li>
                <strong>New Here?</strong> Get $25 off your first service! Use code
                <code className="mx-1 rounded bg-green-200 px-1.5 py-0.5 font-semibold text-green-900 dark:bg-green-700 dark:text-green-100">FIRST25</code>
                in the "Promo Code" field below.
              </li>
              <li>
                <strong>Referred by a Friend?</strong> Enter their full name in the "Referred By" field. You'll both save $25!
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        {/* END: Promotional Alert */}
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
                              {servicesLoadingError && (
                                <Alert variant="destructive" className="md:col-span-2">
                                  <AlertTitle>Error Loading Services</AlertTitle>
                                  <AlertDescription>
                                    {servicesLoadingError} Please try refreshing the page.
                                  </AlertDescription>
                                </Alert>
                              )}
                              {!servicesLoadingError && fetchedServicesList.length === 0 && (
                                <p className="text-gray-500 md:col-span-2">Loading service options...</p>
                              )}
                              {fetchedServicesList.map((service) => (
                                <FormItem key={service.id} className="relative">
                                  <FormControl>
                                    <RadioGroupItem value={service.key} id={service.key} className="peer sr-only" />
                                  </FormControl>
                                  <Label
                                    htmlFor={service.key}
                                    className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5 h-full"
                                  >
                                    <span className="font-semibold">{service.name}</span>
                                    <span className="text-lg font-bold text-[#002147] mt-auto pt-2">
                                      ${service.basePrice}
                                      {service.requiresDeposit && service.depositAmount && (
                                        <span className="text-xs font-normal text-gray-500 block">(${service.depositAmount} deposit)</span>
                                      )}
                                    </span>
                                  </Label>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Estimated Price:</h3>
                          <p className="text-sm text-gray-500">Based on service type and number of signers</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#002147]">${getServicePrice()}</div>
                          {selectedServiceDetail && selectedServiceDetail.requiresDeposit && selectedServiceDetail.depositAmount && selectedServiceDetail.depositAmount > 0 && (
                            <p className="text-xs text-orange-600 font-semibold">
                              Includes a ${selectedServiceDetail.depositAmount} deposit, payable upon booking.
                            </p>
                          )}
                        </div>
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
                      serviceType={mapServiceTypeForCalendar(serviceType)} 
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

                    {/* BEGIN: Mileage Fee Notice Alert */}
                    <Alert className="mt-4 mb-4 border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <AlertTitle className="font-semibold text-blue-800 dark:text-blue-200">Mileage Fee Notice</AlertTitle>
                      <AlertDescription className="text-sm">
                        For locations beyond a 20-mile radius from our business base (zip code <strong>77591</strong>), a mileage fee of $1.10 per additional mile (round trip) will apply. This will be calculated and invoiced separately after your booking is confirmed, if applicable.
                      </AlertDescription>
                    </Alert>
                    {/* END: Mileage Fee Notice Alert */}

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

                        {/* Promo Code Input */}
                        <FormField
                          control={form.control}
                          name="promoCode"
                          render={({ field }) => (
                            <FormItem className="my-2">
                              <FormLabel>Promo Code (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter promo code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
