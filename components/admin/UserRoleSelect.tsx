'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UserRoleSelectProps {
  userId: string;
  currentRole: Role;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleChange = async (newRoleValue: string) => {
    const newRole = newRoleValue as Role;
    if (newRole === selectedRole) return; // No change

    setIsUpdating(true);
    setSelectedRole(newRole); // Optimistic UI update

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Revert optimistic update on error
        setSelectedRole(currentRole);
        throw new Error(errorData.error || 'Failed to update role');
      }

      // Success
      toast({
        title: "Role Updated",
        description: `User role successfully changed to ${newRole}.`,
      });
      // Optionally refresh the page or specific data if needed,
      // though optimistic update handles the visual change.
      // router.refresh(); 

    } catch (err: any) {
      console.error("Role update error:", err);
       // Revert optimistic update on error (already done above but good to be sure)
      setSelectedRole(currentRole);
      toast({
        variant: "destructive",
        title: "Error Updating Role",
        description: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get all possible roles for the dropdown
  const roleOptions = Object.values(Role);

  return (
    <Select
      value={selectedRole}
      onValueChange={handleRoleChange} // Trigger API call on change
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[120px]"> {/* Adjust width as needed */}
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((role) => (
          <SelectItem key={role} value={role}>
            {/* Simple formatting for display */}
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 