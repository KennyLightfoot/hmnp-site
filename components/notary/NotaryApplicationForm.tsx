'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const notaryApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  commissionNumber: z.string().optional(),
  commissionState: z.string().optional(),
  commissionExpiry: z.string().optional(),
  statesLicensed: z.array(z.string()).min(1, 'At least one state is required'),
  countiesServed: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  serviceTypes: z.array(z.string()).min(1, 'At least one service type is required'),
  languagesSpoken: z.array(z.string()).optional(),
  specialCertifications: z.array(z.string()).optional(),
  eoInsuranceProvider: z.string().optional(),
  eoInsurancePolicy: z.string().optional(),
  eoInsuranceExpiry: z.string().optional(),
  baseAddress: z.string().optional(),
  baseZip: z.string().optional(),
  serviceRadiusMiles: z.number().int().min(1).max(100).optional(),
  availabilityNotes: z.string().optional(),
  whyInterested: z.string().optional(),
  references: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

type NotaryApplicationFormValues = z.infer<typeof notaryApplicationSchema>

const TEXAS_COUNTIES = [
  'Harris', 'Fort Bend', 'Montgomery', 'Brazoria', 'Galveston', 'Chambers',
  'Liberty', 'Waller', 'Austin', 'Brazos', 'Grimes', 'Washington'
]

const SERVICE_TYPES = [
  'Standard Notary',
  'Mobile Notary',
  'Loan Signing Specialist',
  'RON (Remote Online Notary)',
  'Extended Hours',
  'Estate Planning',
  'Business Documents'
]

const LANGUAGES = ['English', 'Spanish', 'Vietnamese', 'Chinese', 'Arabic', 'French', 'Other']

export default function NotaryApplicationForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<NotaryApplicationFormValues>({
    resolver: zodResolver(notaryApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      commissionNumber: '',
      commissionState: 'TX',
      commissionExpiry: '',
      statesLicensed: [],
      countiesServed: [],
      yearsExperience: undefined,
      serviceTypes: [],
      languagesSpoken: [],
      specialCertifications: [],
      eoInsuranceProvider: '',
      eoInsurancePolicy: '',
      eoInsuranceExpiry: '',
      baseAddress: '',
      baseZip: '',
      serviceRadiusMiles: 25,
      availabilityNotes: '',
      whyInterested: '',
      references: '',
      resumeUrl: '',
      termsAccepted: false,
    },
  })

  const onSubmit = async (data: NotaryApplicationFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notary/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Use message field if available, otherwise fall back to error field
        const errorMessage = errorData.message || errorData.error || 'Failed to submit application'
        throw new Error(errorMessage)
      }

      toast({
        title: 'Application Submitted',
        description: 'Thank you for your interest! We\'ll review your application and get back to you soon.',
      })

      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Commission Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Notary Commission Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="commissionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commissionState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="TX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commissionExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-4">
              <FormField
                control={form.control}
                name="statesLicensed"
                render={() => (
                  <FormItem>
                    <FormLabel>States Licensed *</FormLabel>
                    <FormDescription>Select all states where you hold an active commission</FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {['TX', 'LA', 'OK', 'AR', 'NM'].map((state) => (
                        <FormField
                          key={state}
                          control={form.control}
                          name="statesLicensed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(state)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, state])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== state)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{state}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Service Information</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="serviceTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Service Types *</FormLabel>
                    <FormDescription>Select all services you can provide</FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {SERVICE_TYPES.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="serviceTypes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== type)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{type}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceRadiusMiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Radius (miles)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E&O Insurance */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Errors & Omissions Insurance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="eoInsuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eoInsurancePolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eoInsuranceExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="baseAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your home or office address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseZip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Link to your resume" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whyInterested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why are you interested in joining our network?</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availabilityNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Preferred hours, days of week, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the terms and conditions and understand that this is an application for independent contractor work *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>
    </Form>
  )
}

