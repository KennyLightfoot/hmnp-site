'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays } from 'lucide-react';

const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms";

// Example: Fetch available events from an API or define statically
// For now, let's use a static list. In a real app, this might come from props or an API.
const availableEvents = [
  { id: 'webinar-notary-basics', name: 'Webinar: Notary Basics & Best Practices (Online)' },
  { id: 'workshop-loan-signing', name: 'Workshop: Advanced Loan Signing (In-Person)' },
  { id: 'meetup-networking', name: 'Community Meetup: Notary Networking Event' },
] as const;

type EventId = typeof availableEvents[number]['id'];

const eventRegistrationSchema = z.object({
  eventName: z.string().optional(), // Will be set if this form is for a specific event page
  selectedEventId: z.custom<EventId>(val => availableEvents.some(event => event.id === val),{
    message: 'Please select a valid event.',
  }).optional(), // Optional if eventName is pre-filled
  name: z.string().min(1, { message: 'Your full name is required.' }),
  email: z.string().email({ message: 'A valid email address is required.' }),
  phone: z.string().optional().or(z.literal('')),
  numberOfAttendees: z.number().min(1, 'At least one attendee is required.').int().optional(),
  dietaryRestrictions: z.string().optional(),
  consentToCommunications: z.boolean(),
}).refine(data => data.eventName || data.selectedEventId, {
    message: 'An event must be specified or selected.',
    path: ['selectedEventId'], // Point error to selector if generic form
});

type EventRegistrationFormValues = z.infer<typeof eventRegistrationSchema>;

interface EventRegistrationFormProps {
  eventName?: string; // If this form is for a specific event, pass its name
  eventId?: EventId; // If this form is for a specific event, pass its ID
}

export default function EventRegistrationForm({ eventName, eventId }: EventRegistrationFormProps) {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const isSpecificEventForm = !!(eventName && eventId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventRegistrationFormValues>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      eventName: eventName || '',
      selectedEventId: eventId || undefined,
      name: '',
      email: '',
      phone: '',
      numberOfAttendees: 1,
      dietaryRestrictions: '',
      consentToCommunications: true,
    },
  });

  useEffect(() => {
    if (isSpecificEventForm) {
        setValue('eventName', eventName);
        setValue('selectedEventId', eventId);
    }
  }, [eventName, eventId, setValue, isSpecificEventForm]);

  const onSubmit = async (data: EventRegistrationFormValues) => {
    setSubmissionStatus('submitting');
    setServerError(null);
    
    // Ensure eventId is included if selectedEventId is used
    const payload = {
        ...data,
        eventId: data.selectedEventId || eventId, // Prioritize selected, then prop
    };
    delete payload.selectedEventId; // Clean up schema-only field if needed

    console.log('Event Registration Submitted:', payload);

    try {
      // TODO: Implement actual API call to /api/events/register
      // const response = await fetch('/api/events/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Event registration failed.');
      // }

      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionStatus('success');
      reset({
        eventName: eventName || '',
        selectedEventId: eventId || undefined,
        name: '',
        email: '',
        phone: '',
        numberOfAttendees: 1,
        dietaryRestrictions: '',
        consentToCommunications: true,
      });
    } catch (error: any) {
      setSubmissionStatus('error');
      setServerError(error.message || 'Failed to register for the event. Please try again.');
    }
  };

  const currentEventName = eventName || availableEvents.find(e => e.id === watch('selectedEventId'))?.name;

  if (submissionStatus === 'success') {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <CalendarDays className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Registration Confirmed!</h2>
        <p className="text-gray-700 mb-2">
          You have successfully registered{currentEventName ? ` for ${currentEventName}` : ''}. 
          We look forward to seeing you!
        </p>
        <p className="text-gray-600 text-sm">
          A confirmation email with event details has been sent to your email address.
        </p>
        <Button onClick={() => setSubmissionStatus('idle')} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Register for Another Event
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start mb-2">
          <CalendarDays className="h-8 w-8 text-[#002147] mr-2" />
          <h2 className="text-2xl font-semibold text-[#002147]">{isSpecificEventForm ? `Register for: ${eventName}` : 'Event Registration'}</h2>
        </div>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Connect and Learn With Us</p>
        <p className="text-muted-foreground mt-2">
          {isSpecificEventForm 
            ? `Secure your spot for ${eventName}. Please fill out the details below.`
            : 'Select an upcoming event and fill in your details to register. We host informative webinars and workshops regularly.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isSpecificEventForm && (
          <div>
            <Label htmlFor="selectedEventId" className="block text-sm font-medium text-gray-700 mb-1">Select Event</Label>
            <Select 
                onValueChange={(value: EventId) => setValue('selectedEventId', value, { shouldValidate: true })}
                defaultValue={control._defaultValues.selectedEventId}
            >
              <SelectTrigger id="selectedEventId" className={errors.selectedEventId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.selectedEventId && <p className="mt-1 text-xs text-red-600">{errors.selectedEventId.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Alex Johnson" className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</Label>
            <Input id="email" type="email" {...register('email')} placeholder="e.g., alex.johnson@example.com" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</Label>
            <Input id="phone" type="tel" {...register('phone')} placeholder="(555) 234-5678" />
          </div>
          <div>
            <Label htmlFor="numberOfAttendees" className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees (Optional)</Label>
            <Input id="numberOfAttendees" type="number" {...register('numberOfAttendees', { valueAsNumber: true })} placeholder="1" min="1" />
             {errors.numberOfAttendees && <p className="mt-1 text-xs text-red-600">{errors.numberOfAttendees.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions or Special Requests (Optional)</Label>
          <Textarea id="dietaryRestrictions" {...register('dietaryRestrictions')} rows={3} placeholder="e.g., Vegetarian, Gluten-Free, accessibility needs..." />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="consentToCommunications" {...register('consentToCommunications')} defaultChecked={control._defaultValues.consentToCommunications} />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="consentToCommunications" className="text-sm font-medium text-gray-700">
              I agree to receive email communications regarding this event and other relevant updates from Houston Mobile Notary Pros.
            </Label>
             {errors.consentToCommunications && <p className="mt-1 text-xs text-red-600">{errors.consentToCommunications.message}</p>}
          </div>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            <p>{serverError}</p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={submissionStatus === 'submitting'}
          className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white py-2.5 px-4 rounded-md font-semibold transition-colors duration-150 ease-in-out flex items-center justify-center"
        >
          {submissionStatus === 'submitting' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </>
          ) : (
            <><CalendarDays className="h-5 w-5 mr-2" /> Register for Event</>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          Event details are subject to change. Please check your email for updates. Refer to our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
