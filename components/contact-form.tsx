"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { submitContactForm } from "@/app/actions/submit-form"

// Import the necessary functions at the top of the file
import { getPendingSubmissions } from "@/lib/form-fallback"
import { getApiHealthStatus, retryPendingSubmissions } from "@/lib/gohighlevel"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  interest: z.string().optional(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      interest: "",
      message: "",
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
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string)
      })

      const result = await submitContactForm(formData)

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
            "We're experiencing connection issues. Your message has been saved and will be submitted automatically when the connection is restored.",
          )
        }
      }
    } catch (err) {
      // Check API health
      const apiStatus = getApiHealthStatus()

      if (!apiStatus.healthy) {
        setError(
          "We're experiencing connection issues. Your message has been saved and will be submitted automatically when the connection is restored.",
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
        <h3 className="text-2xl font-bold text-primary mb-2">Message Sent!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your message. We'll get back to you as soon as possible.
        </p>
        <Button onClick={() => setIsSuccess(false)}>Send Another Message</Button>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-lg border border-secondary/20 bg-card">
      <h3 className="text-xl font-semibold text-primary mb-6">Get in Touch</h3>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-first-name">First Name</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-first-name"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-last-name">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-last-name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="contact-email"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="contact-phone">Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      id="contact-phone"
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

          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="contact-interest">Interest (Optional)</FormLabel>
                <FormControl>
                  <Input
                    id="contact-interest"
                    placeholder="What service are you interested in?"
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
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="contact-message">Message</FormLabel>
                <FormControl>
                  <Textarea
                    id="contact-message"
                    placeholder="Please provide details about your inquiry..."
                    className="resize-none min-h-[120px] focus-visible:ring-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

