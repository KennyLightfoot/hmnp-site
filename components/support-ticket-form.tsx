import React, { useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Shadcn Select

const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms";

const issueCategories = [
  'Technical Issue with Website',
  'Problem with a Notary Service',
  'Billing Question or Discrepancy',
  'Question About Our Services',
  'Request for Information',
  'General Feedback or Suggestion',
  'Other',
] as const;

const urgencyLevels = ['Low', 'Medium', 'High'] as const;

const supportTicketSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'A valid email address is required.' }),
  phone: z.string().optional().or(z.literal('')),
  issueCategory: z.enum(issueCategories, { required_error: 'Please select an issue category.' }),
  description: z.string().min(20, { message: 'Please provide a detailed description (at least 20 characters).' }),
  urgency: z.enum(urgencyLevels),
  fileUpload: z.custom<FileList>().optional() // Placeholder for file upload
    .refine(files => !files || files.length === 0 || (files[0] && files[0].size <= 5 * 1024 * 1024), `Max file size is 5MB.`) // Example validation
    .refine(files => !files || files.length === 0 || (files[0] && ['image/jpeg', 'image/png', 'application/pdf'].includes(files[0].type)), `Only JPG, PNG, or PDF files are allowed.`),
});

interface SupportTicketFormValues {
  name: string;
  email: string;
  phone?: string;
  issueCategory: typeof issueCategories[number];
  description: string;
  urgency: typeof urgencyLevels[number];
  fileUpload?: FileList;
}

export default function SupportTicketForm() {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control, // For Shadcn Select compatibility
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      issueCategory: undefined,
      description: '',
      urgency: 'Medium' as const,
      fileUpload: undefined,
    },
  });

  const selectedFile = watch('fileUpload');

  const onSubmit = async (data: SupportTicketFormValues) => {
    setSubmissionStatus('submitting');
    setServerError(null);
    
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    formData.append('issueCategory', data.issueCategory);
    formData.append('description', data.description);
    if (data.urgency) formData.append('urgency', data.urgency);
    if (data.fileUpload && data.fileUpload.length > 0 && data.fileUpload[0]) {
      formData.append('attachment', data.fileUpload[0]);
    }
    try {
      const response = await fetch('/api/support/create-ticket', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Something went wrong.');
      }

      setSubmissionStatus('success');
      reset();
    } catch (error: any) {
      setSubmissionStatus('error');
      setServerError(getErrorMessage(error) || 'Failed to submit your ticket. Please try again.');
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Ticket Submitted Successfully!</h2>
        <p className="text-gray-700 mb-2">
          Thank you for reaching out. Your support ticket has been received.
        </p>
        <p className="text-gray-600 text-sm">
          We will review your request and get back to you as soon as possible. Please check your email for a confirmation and ticket ID.
        </p>
        <Button onClick={() => setSubmissionStatus('idle')} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Submit Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-2xl font-semibold text-[#002147]">Submit a Support Request</h2>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - We're Here to Help</p>
        <p className="text-muted-foreground mt-2">
          Please provide as much detail as possible so we can assist you effectively. We aim to resolve issues with clarity and care.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., John Doe" className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</Label>
            <Input id="email" type="email" {...register('email')} placeholder="e.g., john.doe@example.com" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</Label>
          <Input id="phone" type="tel" {...register('phone')} placeholder="(555) 123-4567" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="issueCategory" className="block text-sm font-medium text-gray-700 mb-1">Issue Category</Label>
                <Select onValueChange={(value) => setValue('issueCategory', value as typeof issueCategories[number], { shouldValidate: true })} defaultValue={control._defaultValues.issueCategory}>
                    <SelectTrigger id="issueCategory" className={errors.issueCategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                    {issueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {errors.issueCategory && <p className="mt-1 text-xs text-red-600">{errors.issueCategory.message}</p>}
            </div>
            <div>
                <Label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</Label>
                <Select onValueChange={(value) => setValue('urgency', value as typeof urgencyLevels[number], { shouldValidate: true })} defaultValue={control._defaultValues.urgency || 'Medium'}>
                    <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency..." />
                    </SelectTrigger>
                    <SelectContent>
                    {urgencyLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description of Issue</Label>
          <Textarea id="description" {...register('description')} rows={6} placeholder="Please describe the problem you are experiencing, including any steps to reproduce it or relevant details..." className={errors.description ? 'border-red-500' : ''} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <Label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-1">Attach File (Optional)</Label>
          <Input id="fileUpload" type="file" {...register('fileUpload')} className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#002147] file:text-white hover:file:bg-[#001730]" />
          <p className="mt-1 text-xs text-muted-foreground">Max file size: 5MB. Allowed types: JPG, PNG, PDF. Your backend will need S3 integration for secure storage.</p>
          {errors.fileUpload && <p className="mt-1 text-xs text-red-600">{errors.fileUpload.message}</p>}
          {selectedFile && selectedFile.length > 0 && selectedFile[0] && <p className="mt-1 text-xs text-green-600">Selected file: {selectedFile[0].name}</p>}
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
              Submitting Ticket...
            </>
          ) : (
            'Submit Support Ticket'
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          We are committed to providing excellent support. Please also see our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a> for more information.
        </p>
      </div>
    </div>
  );
}
