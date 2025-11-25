'use client'

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assignmentSchema, AssignmentFormData } from '@/lib/validations';
import { Role } from '@/lib/prisma-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // If needed for description/notes later
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form, // Use shadcn Form component
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AssignmentFormProps {
  // Use a structural type here instead of depending on Prisma's Assignment model
  initialData?: {
    id: string;
    title: string | null;
    borrowerName: string | null;
    propertyAddress: string | null;
    closingDate: string | Date | null;
    partnerAssignedToId: string | null;
    allowPartnerComments: boolean | null;
    reference: string | null;
  } | null; // For editing
  onSubmitSuccess?: (assignmentId: string) => void; // Optional callback on success
}

// Simplified User type for partner list (structural type, not tied to Prisma)
type PartnerUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export function AssignmentForm({ initialData, onSubmitSuccess }: AssignmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState<PartnerUser[]>([]);

  const isEditing = !!initialData;

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: initialData?.title || '',
      borrowerName: initialData?.borrowerName || '',
      propertyAddress: initialData?.propertyAddress || '',
      closingDate: initialData?.closingDate ? new Date(initialData.closingDate) : null,
      partnerAssignedToId: initialData?.partnerAssignedToId || null,
      allowPartnerComments: initialData?.allowPartnerComments ?? false,
      reference: initialData?.reference || '',
    },
  });

  // Fetch partners on component mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // TODO: Replace with an API route dedicated to fetching partners if needed
        // For now, assuming an admin/staff fetching this form can get all users
        // and filter client-side. This is NOT ideal for many users.
        // A better approach is an API route like /api/users?role=PARTNER
        const response = await fetch('/api/users'); // Adjust if you have a user API
        if (!response.ok) throw new Error('Failed to fetch users');
        const allUsers: PartnerUser[] = await response.json();
        const partnerUsers = allUsers
           .filter(user => user.role === Role.PARTNER)
           .map(p => ({ id: p.id, name: p.name, email: p.email })); // Select only needed fields
        setPartners(partnerUsers);
      } catch (error) {
        console.error("Failed to fetch partners:", getErrorMessage(error));
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load partner list.' });
      }
    };
    fetchPartners();
  }, [toast]);


  const onSubmit = async (data: AssignmentFormData) => {
    setIsLoading(true);
    const apiUrl = isEditing ? `/api/assignments/${initialData.id}` : '/api/assignments';
    const method = isEditing ? 'PUT' : 'POST';

    console.log("Submitting data:", data); // Debug log

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle Zod errors specifically if they are returned in result.error
        if (Array.isArray(result.error)) {
           result.error.forEach((err: any) => {
             form.setError(err.path[0], { type: 'manual', message: err.message });
           });
           throw new Error('Validation failed');
        }
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} assignment`);
      }

      // Success
      toast({
        title: `Assignment ${isEditing ? 'Updated' : 'Created'}`,
        description: `Assignment "${result.title || data.title}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
      });

      // Call success callback or redirect
       if (onSubmitSuccess) {
         onSubmitSuccess(result.id); // Pass the ID back
       } else {
         // Default redirect to the new/edited assignment or the portal list
         router.push(`/portal/${result.id}`);
         router.refresh(); // Refresh potentially stale data on previous pages
       }

    } catch (error: any) {
      console.error(`Assignment ${isEditing ? 'update' : 'creation'} error:`, getErrorMessage(error));
      // Avoid setting form error if it's not a validation error
      if (getErrorMessage(error) !== 'Validation failed') {
          toast({
            variant: "destructive",
            title: `Error ${isEditing ? 'Updating' : 'Creating'} Assignment`,
            description: getErrorMessage(error) || 'An unexpected error occurred.',
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Smith Refinance Closing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Borrower Name */}
           <FormField
            control={form.control}
            name="borrowerName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Borrower Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

           {/* Property Address */}
           <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                    <Input placeholder="123 Main St, Houston, TX" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Closing Date */}
          <FormField
            control={form.control}
            name="closingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Closing Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                       onSelect={(date) => field.onChange(date ?? null)} // Ensure null is passed if date is undefined
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

           {/* Assign Partner */}
          <FormField
            control={form.control}
            name="partnerAssignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Partner (Optional)</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} defaultValue={field.value ?? 'none'}>
                  <FormControl>
                    <SelectTrigger>
                       <SelectValue placeholder="Select a partner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     <SelectItem value="none">-- None --</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                         {partner.name || partner.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Allow Partner Comments Checkbox */}
        <FormField
          control={form.control}
          name="allowPartnerComments"
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
                  Allow Partner Comments
                </FormLabel>
                <FormDescription>
                  Check this box to allow the assigned partner to add comments to this assignment.
                </FormDescription>
              </div>
               <FormMessage />
            </FormItem>
          )}
        />

        {/* Reference Field (Optional) */}
         <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference / File # (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Title Co File #12345" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>
                  A unique reference identifier for this assignment (optional).
                </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Assignment' : 'Create Assignment')}
        </Button>
      </form>
    </Form>
  );
} 
