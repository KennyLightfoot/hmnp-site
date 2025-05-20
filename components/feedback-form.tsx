import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StarIcon } from 'lucide-react'; // Assuming lucide-react for icons

const MAX_RATING = 5;
const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms";

const feedbackFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')), // Optional but must be valid if provided
  rating: z.number().min(1, { message: 'Rating is required.' }).max(MAX_RATING),
  comments: z.string().min(10, { message: 'Please provide at least 10 characters for your comments.' }),
  consentToDisplay: z.boolean().refine(val => val === true, {
    message: 'You must consent to display your testimonial if you wish for it to be featured.',
  }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackForm() {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: '',
      email: '',
      rating: 0,
      comments: '',
      consentToDisplay: false,
    },
  });

  const handleRatingChange = (rate: number) => {
    setCurrentRating(rate);
    setValue('rating', rate, { shouldValidate: true });
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    setSubmissionStatus('submitting');
    setServerError(null);
    console.log('Feedback Form Submitted:', data); // Placeholder for actual submission

    try {
      // TODO: Replace with actual API call to /api/feedback or /api/testimonials
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Something went wrong.');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionStatus('success');
      reset(); 
      setCurrentRating(0); // Reset star display
    } catch (error: any) {
      setSubmissionStatus('error');
      setServerError(error.message || 'Failed to submit feedback. Please try again.');
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Thank You!</h2>
        <p className="text-gray-700">Your feedback has been successfully submitted. We appreciate you taking the time to share your thoughts and help us improve our services.</p>
        <Button onClick={() => setSubmissionStatus('idle')} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Submit Another Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-2xl font-semibold text-[#002147]">Share Your Experience</h2>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - We Value Your Feedback</p>
        <p className="text-muted-foreground mt-2">
          Your opinion helps us improve and continue to provide the calm, clear, and professional service you deserve. Please let us know how we did.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g., Jane Doe" className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</Label>
          <Input id="email" type="email" {...register('email')} placeholder="e.g., jane.doe@example.com" className={errors.email ? 'border-red-500' : ''} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</Label>
          <div className="flex space-x-1">
            {[...Array(MAX_RATING)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <StarIcon 
                  key={ratingValue} 
                  className={`h-7 w-7 cursor-pointer ${currentRating >= ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleRatingChange(ratingValue)}
                />
              );
            })}
          </div>
          <input type="hidden" {...register('rating')} />
          {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
        </div>

        <div>
          <Label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments / Testimonial</Label>
          <Textarea id="comments" {...register('comments')} rows={5} placeholder="Tell us about your experience..." className={errors.comments ? 'border-red-500' : ''} />
          {errors.comments && <p className="mt-1 text-xs text-red-600">{errors.comments.message}</p>}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox id="consentToDisplay" {...register('consentToDisplay')} className={errors.consentToDisplay ? 'border-red-500' : ''} />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="consentToDisplay" className="text-sm font-medium text-gray-700">
              I consent to Houston Mobile Notary Pros displaying my feedback (name, rating, and comments) as a testimonial on their website and marketing materials.
            </Label>
            <p className="text-xs text-muted-foreground">
              Your email will never be shared. You can request removal of your testimonial at any time.
            </p>
            {errors.consentToDisplay && <p className="mt-1 text-xs text-red-600">{errors.consentToDisplay.message}</p>}
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
              Submitting Feedback...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          Your privacy is important to us. For more information on how we handle your data, please see our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
