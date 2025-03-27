"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { submitBookingForm } from "@/app/actions/submit-form"
import { getPendingSubmissions } from "@/lib/form-fallback"
import { getApiHealthStatus, retryPendingSubmissions } from "@/lib/gohighlevel"
import { AddressInput } from "@/components/address-input"

// This schema should match the expected structure in the server action
const formSchema = z.object({
  contactInfo: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    additionalInfo: z.string().optional(),
  }),
  serviceDetails: z.object({
    serviceType: z.enum(["essential", "priority", "loan", "reverse", "specialty"]),
    numberOfSigners: z.coerce.number().min(1, "At least 1 signer is required"),
    numberOfDocuments: z.coerce.number().min(1, "At least 1 document is required"),
    location: z.string().min(5, "Please enter the full service location"),
    documentInfo: z.string().optional(),
    preferredDate: z.string().min(1, "Please select a date"),
    preferredTime: z.enum(["morning", "afternoon", "evening"]),
    weekendService: z.boolean().default(false),
    extendedTravel: z.boolean().default(false),
  }),
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms of service" }),
  }),
})

type FormValues = z.infer<typeof formSchema>

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        additionalInfo: "",
      },
      serviceDetails: {
        serviceType: "essential",
        numberOfSigners: 1,
        numberOfDocuments: 1,
        location: "",
        documentInfo: "",
        preferredDate: "",
        preferredTime: "morning",
        weekendService: false,
        extendedTravel: false,
      },
      termsAgreed: false,
    },
  })

  // Check for pending submissions on component mount
  useEffect(() => {
    const checkPendingSubmissions = async () => {
      if (pendingSubmissionId) {
        try {
          const apiStatus = getApiHealthStatus()
          if (apiStatus.healthy) {
            const result = await retryPendingSubmissions()
            if (result.success > 0) {
              setIsSuccess(true)
              setPendingSubmissionId(null)
            }
          }
        } catch (error) {
          console.error("Error retrying submissions:", error)
        }
      }
    }

    const interval = setInterval(checkPendingSubmissions, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [pendingSubmissionId])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setError(null)

    try {
      // Convert form data to FormData object
      const formData = new FormData()

      // Add contact info
      Object.entries(values.contactInfo).forEach(([key, value]) => {
        formData.append(`contactInfo.${key}`, value as string)
      })

      // Add service details
      Object.entries(values.serviceDetails).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          formData.append(`serviceDetails.${key}`, value ? "true" : "false")
        } else {
          formData.append(`serviceDetails.${key}`, value as string)
        }
      })

      // Explicitly add terms agreement
      formData.append("termsAgreed", values.termsAgreed ? "true" : "false")

      const result = await submitBookingForm(formData)

      if (result.success) {
        setIsSuccess(true)
        form.reset()

        // Check if there are any pending submissions and try to process them
        const pendingCount = getPendingSubmissions().length
        if (pendingCount > 0) {
          try {
            await retryPendingSubmissions()
          } catch (error) {
            console.error("Failed to process pending submissions:", error)
          }
        }
      } else {
        setError(result.errors?._form || "Something went wrong. Please try again.")

        // If there's a pending submission ID, store it
        if (result.pendingSubmissionId) {
          setPendingSubmissionId(result.pendingSubmissionId)
          setError(
            "We're experiencing connection issues. Your booking has been saved and will be submitted automatically when the connection is restored.",
          )
        }
      }
    } catch (err) {
      // Check API health
      const apiStatus = getApiHealthStatus()

      if (!apiStatus.healthy) {
        setError(
          "We're experiencing connection issues. Your booking has been saved and will be submitted automatically when the connection is restored.",
        )
        // We don't set isSuccess here because the submission is pending
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="p-8 text-center rounded-lg border border-primary/20 bg-primary/5">
        <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-primary mb-2">Booking Submitted!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your booking request. We'll contact you shortly to confirm your appointment.
        </p>
        <Button onClick={() => setIsSuccess(false)}>Submit Another Request</Button>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-lg border border-secondary/20 bg-card">
      <h3 className="text-xl font-semibold text-primary mb-6">Schedule Your Notary Service</h3>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-lg mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactInfo.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="booking-first-name">First Name</FormLabel>
                      <FormControl>
                        <Input
                          id="booking-first-name"
                          placeholder="John"
                          autoComplete="given-name"
                          {...field}
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="booking-last-name">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          id="booking-last-name"
                          placeholder="Doe"
                          autoComplete="family-name"
                          {...field}
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="booking-email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="booking-email"
                          type="email"
                          placeholder="john@example.com"
                          autoComplete="email"
                          {...field}
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="booking-phone">Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          id="booking-phone"
                          placeholder="(555) 555-5555"
                          value={field.value}
                          onChange={field.onChange}
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-lg mb-4">Service Details</h4>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="serviceDetails.serviceType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel id="service-type-group">Service Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          aria-labelledby="service-type-group"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="essential"
                                id="service-essential"
                                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="service-essential" className="font-normal cursor-pointer">
                              Essential
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="priority"
                                id="service-priority"
                                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="service-priority" className="font-normal cursor-pointer">
                              Priority
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="loan"
                                id="service-loan"
                                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="service-loan" className="font-normal cursor-pointer">
                              Loan Signing
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="reverse"
                                id="service-reverse"
                                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="service-reverse" className="font-normal cursor-pointer">
                              Reverse Mortgage
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="specialty"
                                id="service-specialty"
                                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
                              />
                            </FormControl>
                            <FormLabel htmlFor="service-specialty" className="font-normal cursor-pointer">
                              Specialty
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="serviceDetails.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="booking-location">Service Location</FormLabel>
                        <FormControl>
                          <AddressInput
                            id="booking-location"
                            placeholder="123 Main St, City, State, ZIP"
                            value={field.value}
                            onChange={field.onChange}
                            onAddressSelect={field.onChange}
                            className="focus-visible:ring-primary"
                            autoComplete="street-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.preferredDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel htmlFor="booking-date">Preferred Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                id="booking-date"
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                                type="button"
                              >
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 text-primary" aria-hidden="true" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="[&_.rdp-day_button:focus]:bg-primary [&_.rdp-day_button:hover]:bg-primary/10 [&_.rdp-day_button[aria-selected='true']]:bg-primary"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="booking-time">Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger id="booking-time">
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (1pm - 5pm)</SelectItem>
                            <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.numberOfSigners"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="booking-signers">Number of Signers</FormLabel>
                        <FormControl>
                          <Input
                            id="booking-signers"
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            className="focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.numberOfDocuments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="booking-documents">Number of Documents</FormLabel>
                        <FormControl>
                          <Input
                            id="booking-documents"
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                            className="focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.documentInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="booking-doc-info">Document Information (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            id="booking-doc-info"
                            placeholder="Brief description of documents"
                            {...field}
                            className="focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="serviceDetails.weekendService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox id="weekend-service" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="weekend-service">Weekend Service</FormLabel>
                          <p className="text-sm text-muted-foreground">Check if you need service on a weekend</p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDetails.extendedTravel"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                          <Checkbox id="extended-travel" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor="extended-travel">Extended Travel</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Check if your location is outside our standard service area
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="contactInfo.additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="booking-additional-info">Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="booking-additional-info"
                      placeholder="Please provide any additional details about your service needs..."
                      className="resize-none focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAgreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                  <FormControl>
                    <Checkbox
                      id="terms-agreed"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true)
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="terms-agreed">Terms of Service</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <a
                        href="/terms-of-service"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy-policy"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        privacy policy
                      </a>
                      .
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              "Schedule Appointment"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

