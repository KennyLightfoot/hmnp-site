import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ShieldCheck } from 'lucide-react'; // Icons for emphasis

const privacyPolicyLink = "/privacy-policy";
const termsOfServiceLink = "/terms";

const documentTypes = [
  'Identification Document (ID)',
  'Contract / Agreement',
  'Legal Document (Affidavit, Power of Attorney, etc.)',
  'Real Estate Document',
  'Financial Statement',
  'Proof of Address',
  'Other Official Document',
] as const;

// Max file size: 10MB for example
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_FILE_TYPES_STRING = '.pdf, .jpg, .jpeg, .png, .doc, .docx';

const documentUploadSchema = z.object({
  name: z.string().min(1, { message: 'Your full name is required.' }),
  email: z.string().email({ message: 'A valid email address is required for confirmation.' }),
  documentType: z.enum(documentTypes).optional(),
  fileUpload: z.custom<FileList>()
    .refine(files => files && files.length > 0, 'A document is required for upload.')
    .refine(files => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is ${MAX_FILE_SIZE / (1024*1024)}MB.`)
    .refine(files => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type), `Accepted file types: ${ACCEPTED_FILE_TYPES_STRING}.`),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must confirm your authorization and agree to the terms.',
  }),
});

type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

export default function DocumentUploadForm() {
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: '',
      email: '',
      documentType: undefined,
      fileUpload: undefined,
      consent: false,
    },
  });

  const selectedFile = watch('fileUpload');

  const onSubmit = async (data: DocumentUploadFormValues) => {
    setSubmissionStatus('submitting');
    setServerError(null);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.documentType) formData.append('documentType', data.documentType);
    if (data.fileUpload && data.fileUpload.length > 0) {
      formData.append('document', data.fileUpload[0]);
    }
    formData.append('consent', String(data.consent));

    console.log('Preparing to submit document upload:', { 
        name: data.name, 
        email: data.email, 
        documentType: data.documentType, 
        fileName: data.fileUpload?.[0]?.name,
        consent: data.consent 
    });

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && response.status === 201) {
        console.log('API Success:', result);
        setSubmissionStatus('success');
        // Optionally, display result.fileUrl or a more specific success message
        // For now, the generic success message in the form is shown.
        reset(); 
      } else {
        console.error('API Error:', result);
        setServerError(result.message || 'An error occurred during upload. Please try again.');
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Client-side Submission Error:', error);
      let errorMessage = 'A client-side error occurred. Please check your connection and try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      setSubmissionStatus('error');
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white text-center">
        <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Document Uploaded Successfully!</h2>
        <p className="text-gray-700 mb-2">
          Your document has been securely uploaded. You will receive an email confirmation shortly.
        </p>
        <p className="text-gray-600 text-sm">
          Thank you for using Houston Mobile Notary Pros for your secure document needs.
        </p>
        <Button onClick={() => setSubmissionStatus('idle')} className="mt-6 bg-[#002147] hover:bg-[#001730] text-white">
          Upload Another Document
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg shadow-md bg-white">
      <div className="mb-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start mb-2">
          <ShieldCheck className="h-8 w-8 text-[#002147] mr-2" />
          <h2 className="text-2xl font-semibold text-[#002147]">Secure Document Upload</h2>
        </div>
        <p className="text-sm text-gray-700 mt-1 italic">Houston Mobile Notary Pros - Your Documents, Secured.</p>
        <p className="text-muted-foreground mt-2">
          Please use this form to securely upload your documents. We adhere to strict confidentiality and security protocols in compliance with Texas State law for notaries.
        </p>
      </div>

      <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 flex items-start">
        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Important Security Notice:</strong> All uploaded documents are handled with encryption and stored securely via Amazon S3, in accordance with legal requirements for sensitive information. Do not use this form for unsolicited documents.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Jane Doe" className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email Address</Label>
            <Input id="email" type="email" {...register('email')} placeholder="e.g., jane.doe@example.com (for confirmation)" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
            <Label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">Document Type (Optional)</Label>
            <Select onValueChange={(value) => setValue('documentType', value as any, { shouldValidate: true })} defaultValue={control._defaultValues.documentType}>
                <SelectTrigger id="documentType">
                <SelectValue placeholder="Select document type..." />
                </SelectTrigger>
                <SelectContent>
                {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        <div>
          <Label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-1">Document to Upload</Label>
          <Input id="fileUpload" type="file" {...register('fileUpload')} className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#002147] file:text-white hover:file:bg-[#001730] ${errors.fileUpload ? 'border-red-500 ring-red-500' : ''}`} />
          <p className="mt-1 text-xs text-muted-foreground">Accepted types: {ACCEPTED_FILE_TYPES_STRING}. Max size: {MAX_FILE_SIZE / (1024*1024)}MB.</p>
          {errors.fileUpload && <p className="mt-1 text-xs text-red-600">{errors.fileUpload.message}</p>}
          {selectedFile && selectedFile.length > 0 && <p className="mt-1 text-xs text-green-600">Selected file: {selectedFile[0].name} ({(selectedFile[0].size / (1024)).toFixed(1)} KB)</p>}
        </div>

        <div className="flex items-start space-x-3 pt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <Checkbox id="consent" {...register('consent')} className={`mt-1 ${errors.consent ? 'border-red-500' : ''}`} />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="consent" className="text-sm font-medium text-gray-700">
              I confirm that I am authorized to upload this document and I agree to the <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#A52A2A]">Terms of Service</a> regarding document handling and storage.
            </Label>
            <p className="text-xs text-muted-foreground">
              Your document will be handled securely and in compliance with Texas notary law.
            </p>
            {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent.message}</p>}
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
              Uploading Securely...
            </>
          ) : (
            <><ShieldCheck className="h-5 w-5 mr-2" /> Upload Document Securely</>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          We prioritize the security and confidentiality of your documents. For details, please review our <a href={privacyPolicyLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and <a href={termsOfServiceLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
