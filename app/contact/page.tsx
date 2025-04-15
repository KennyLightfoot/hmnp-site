"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Mail, MapPin, Phone, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

// Define the form schema using Zod
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  inquiryType: z.enum(["general", "service", "quote", "feedback", "other"]),
  smsConsent: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
      smsConsent: false,
    },
  })

  const { formState, watch, setValue } = form
  const { errors, isValid } = formState

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Submit the data to the API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        form.reset()
      } else {
        throw new Error(result.message || "Failed to submit contact form")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while submitting your message",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions or need more information? We're here to help. Fill out the form below and we'll get back to you
          as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-2">(123) 456-7890</p>
            <p className="text-sm text-gray-500">Available during business hours</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-2">info@houstonmobilenotarypros.com</p>
            <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-2">Monday-Friday: 9am-5pm</p>
            <p className="text-sm text-gray-500">Priority Service: 7am-9pm daily</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {isSubmitted ? (
            <Card className="shadow-md">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Message Sent Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Thank you for contacting Houston Mobile Notary Pros. We've received your message and will get back to
                  you as soon as possible.
                </p>
                <p className="mb-4">
                  If you have an urgent matter, please call us directly at <strong>(123) 456-7890</strong>.
                </p>
                <Button onClick={() => setIsSubmitted(false)} className="w-full bg-[#002147] hover:bg-[#001a38]">
                  Send Another Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below to get in touch with us</CardDescription>
              </CardHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <Label>Inquiry Type</Label>
                    <RadioGroup
                      defaultValue="general"
                      onValueChange={(value) => setValue("inquiryType", value as any)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">General Inquiry</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="service" id="service" />
                        <Label htmlFor="service">Service Information</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quote" id="quote" />
                        <Label htmlFor="quote">Request a Quote</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feedback" id="feedback" />
                        <Label htmlFor="feedback">Feedback</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" {...form.register("subject")} placeholder="Enter the subject of your message" />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" {...form.register("message")} placeholder="Enter your message" rows={5} />
                    {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsConsent"
                      checked={watch("smsConsent")}
                      onCheckedChange={(checked) => setValue("smsConsent", checked as boolean)}
                    />
                    <Label htmlFor="smsConsent" className="text-sm">
                      I consent to receive SMS messages about my inquiry
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="w-full bg-[#A52A2A] hover:bg-[#8B0000]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader className="bg-[#002147] text-white">
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Service Area
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                We serve clients within a 30-mile radius of ZIP 77591, covering the greater Houston area including:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Houston</li>
                    <li>Galveston</li>
                    <li>League City</li>
                    <li>Pearland</li>
                    <li>Sugar Land</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Katy</li>
                    <li>The Woodlands</li>
                    <li>Baytown</li>
                    <li>Friendswood</li>
                    <li>Missouri City</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Extended service available beyond 30 miles for an additional fee.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#002147]">How quickly can you respond to a request?</h3>
                <p className="text-sm text-gray-600">
                  With our Priority Service, we can respond within 2 hours. Standard service typically requires 24-hour
                  notice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#002147]">What forms of payment do you accept?</h3>
                <p className="text-sm text-gray-600">
                  We accept credit/debit cards (preferred) and cash (exact change required). Corporate billing is
                  available for approved accounts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#002147]">Do you offer weekend appointments?</h3>
                <p className="text-sm text-gray-600">
                  Yes, weekend appointments are available for an additional $50 fee. Priority Service is available 7
                  days a week.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  View All FAQs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
