'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssignmentStatus } from '@/lib/prisma-types' // Import the enum
import { useDebouncedCallback } from 'use-debounce';

interface AssignmentsFilterControlsProps {
  initialSearch?: string;
  initialStatus?: string;
}

export default function AssignmentsFilterControls({
  initialSearch = '',
  initialStatus = '',
}: AssignmentsFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Get current search params

  // Local state for immediate input feedback
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Update URL search parameters
  const updateSearchParams = useCallback((newSearch: string, newStatus: string) => {
    if (!pathname) return; // Handle case where pathname might be null
    
    const params = new URLSearchParams(searchParams?.toString() || ''); // Use current params as base
    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Debounced function for search input
  const debouncedUpdateSearch = useDebouncedCallback((value: string) => {
    updateSearchParams(value, statusFilter);
  }, 500); // Adjust debounce delay as needed (e.g., 500ms)

  // Handler for search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);
    debouncedUpdateSearch(newValue);
  };

  // Handler for status select change
  const handleStatusChange = (value: string) => {
    const newStatus = value === 'ALL' ? '' : value; // Treat 'ALL' as clearing the filter
    setStatusFilter(newStatus);
    updateSearchParams(searchTerm, newStatus); // Update immediately on select change
  };

  // Effect to sync local state if props change (e.g., browser back/forward)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);


  // Get all enum values for the select dropdown
  const statusOptions: AssignmentStatus[] = Object.values(AssignmentStatus) as AssignmentStatus[];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Search by borrower or address..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>
      <div className="w-full sm:w-auto">
         <Select value={statusFilter || 'ALL'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {statusOptions.map((status: AssignmentStatus) => (
                <SelectItem key={status} value={status}>
                    {/* Optional: Format status display */}
                    {status.replace(/_/g, ' ').toLowerCase().replace(/\w/g, (l: string) => l.toUpperCase())}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
    </div>
  );
} 