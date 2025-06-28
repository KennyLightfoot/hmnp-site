'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function InviteUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.PARTNER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setRole(Role.PARTNER);
    setError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !role) {
        setError("Email and role are required.");
        return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite user');
      }

      toast({
        title: "User Invited",
        description: `Successfully invited ${email} as a ${role}.`,
      });
      setIsOpen(false);
      resetForm();
      router.refresh();

    } catch (err: any) {
      console.error("Invite user error:", err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Inviting User",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = Object.values(Role);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Invite User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Enter the email address and select a role for the new user.
             They will need to complete setup via an invitation link (if configured).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
             <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                disabled={isSubmitting}
            >
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
           {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
        </form>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </DialogClose>
          <Button type="submit" form="invite-user-form" disabled={isSubmitting || !email || !role}>
            {isSubmitting ? 'Inviting...' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 