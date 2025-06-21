import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms";

const referralFormSchema = z.object({
  referrerName: z.string().min(1, { message: 'Your name is required.' }),
  referrerContact: z.string().min(1, { message: 'Your contact information (email or phone) is required.' }),
  referralName: z.string().min(1, { message: "The referral's name is required." }),
  referralContact: z.string().min(1, { message: "The referral's contact information (email or phone) is required." }),
  referralContactPreference: z.enum(['Email', 'Phone', 'Either']),
  notes: z.string().optional(),
  consentFromReferrer: z.boolean().refine(val => val === true, {
    message: 'You must confirm that you have informed the person and they consent to being contacted.',
  }),
});

interface ReferralFormValues {
  referrerName: string;
  referrerContact: string;
  referralName: string;
  referralContact: string;
  referralContactPreference: 'Email' | 'Phone' | 'Either';
  notes?: string;
  consentFromReferrer: boolean;
}

export default function ReferralForm() {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control, // For potential future Select components if needed
    formState: { errors },
    reset,
  } = useForm<ReferralFormValues>({
    resolver: zodResolver(referralFormSchema) as any,
    defaultValues: {
      referrerName: '',
      referrerContact: '',
      referralName: '',
      referralContact: '',
      referralContactPreference: 'Either' as const,
      notes: '',
      consentFromReferrer: false,
    },
  });

  const onSubmit = async (data: ReferralFormValues) => {
    setSubmissionStatus('submitting');
    setServerError(null);
    console.log('Referral Form Submitted:', data);

    try {
      // TODO: Implement actual API call to /api/referrals/submit
      // const response = await fetch('/api/referrals/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Something went wrong submitting the referral.');
      // }

      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionStatus('success');
      reset();
    } catch (error: any) {
      setSubmissionStatus('error');
      setServerError(error.message || 'Failed to submit referral. Please try again.');
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Referral Submitted!</h2>
        <p className="text-gray-700 mb-2">
          Thank you for referring someone to Houston Mobile Notary Pros! We appreciate your trust in our services.
        </p>
        <p className="text-gray-600 text-sm">
          We will reach out to them shortly, keeping your recommendation in mind.
        </p>
        <Button onClick={() => setSubmissionStatus('idle')} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Submit Another Referral
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-2xl font-semibold text-[#002147]">Refer a Friend or Colleague</h2>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Share Quality Service</p>
        <p className="text-muted-foreground mt-2">
          Know someone who could benefit from our calm, clear, and professional notary services? Let us know! We appreciate your referrals.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <fieldset className="border border-gray-300 p-4 rounded-md">
          <legend className="text-lg font-medium text-[#002147] px-2">Your Information (Referrer)</legend>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="referrerName" className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</Label>
              <Input id="referrerName" {...register('referrerName')} placeholder="e.g., Jane Smith" className={errors.referrerName ? 'border-red-500' : ''} />
              {errors.referrerName && <p className="mt-1 text-xs text-red-600">{errors.referrerName.message}</p>}
            </div>
            <div>
              <Label htmlFor="referrerContact" className="block text-sm font-medium text-gray-700 mb-1">Your Email or Phone</Label>
              <Input id="referrerContact" {...register('referrerContact')} placeholder="e.g., jane.smith@example.com or (555) 987-6543" className={errors.referrerContact ? 'border-red-500' : ''} />
              {errors.referrerContact && <p className="mt-1 text-xs text-red-600">{errors.referrerContact.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-300 p-4 rounded-md">
          <legend className="text-lg font-medium text-[#002147] px-2">Their Information (Person You're Referring)</legend>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="referralName" className="block text-sm font-medium text-gray-700 mb-1">Their Full Name</Label>
              <Input id="referralName" {...register('referralName')} placeholder="e.g., John Doe" className={errors.referralName ? 'border-red-500' : ''} />
              {errors.referralName && <p className="mt-1 text-xs text-red-600">{errors.referralName.message}</p>}
            </div>
            <div>
              <Label htmlFor="referralContact" className="block text-sm font-medium text-gray-700 mb-1">Their Email or Phone</Label>
              <Input id="referralContact" {...register('referralContact')} placeholder="e.g., john.doe@example.com or (555) 123-4567" className={errors.referralContact ? 'border-red-500' : ''} />
              {errors.referralContact && <p className="mt-1 text-xs text-red-600">{errors.referralContact.message}</p>}
            </div>
            {/* Optional: Add a Select for referralContactPreference if more distinct control is needed */}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Reason for Referral (Optional)</Label>
          <Textarea id="notes" {...register('notes')} rows={3} placeholder="e.g., John is looking for a reliable notary for his upcoming loan signing..." />
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox id="consentFromReferrer" {...register('consentFromReferrer')} className={errors.consentFromReferrer ? 'border-red-500' : ''} />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="consentFromReferrer" className="text-sm font-medium text-gray-700">
              I confirm that I have informed the person I am referring about this introduction and they have consented to being contacted by Houston Mobile Notary Pros.
            </Label>
            {errors.consentFromReferrer && <p className="mt-1 text-xs text-red-600">{errors.consentFromReferrer.message}</p>}
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
              Submitting Referral...
            </>
          ) : (
            'Submit Referral'
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          Referrals are handled with the utmost professionalism and respect for privacy. See our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
