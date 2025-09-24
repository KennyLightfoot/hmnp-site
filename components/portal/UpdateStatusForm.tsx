"use client";

import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { AssignmentStatus } from "@prisma/client";
import { updateAssignmentStatus } from "@/app/portal/_actions/assignments";
// import { toast } from "sonner";

type UpdateStatusFormProps = {
  assignmentId: string;
  currentStatus: AssignmentStatus;
};

// Get all possible enum values
const statusOptions = Object.values(AssignmentStatus);

export function UpdateStatusForm({ assignmentId, currentStatus }: UpdateStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateAssignmentStatus(assignmentId, selectedStatus, note || null);

        if (result.error) {
          throw new Error(result.error);
        }

        // Success
        // toast.success("Status updated successfully!");
        setNote(""); // Clear note on success
        // The page should auto-refresh due to revalidatePath in the action
        // router.refresh(); // Explicit refresh if needed

      } catch (err: any) {
        console.error("Status update failed:", err);
        setError(err.message || "An unexpected error occurred.");
        // toast.error(`Status update failed: ${err.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/40">
      <h4 className="text-md font-semibold">Update Status</h4>
      <div className="space-y-1.5">
        <Label htmlFor="status-select">New Status</Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as AssignmentStatus)}
          disabled={isPending}
        >
          <SelectTrigger id="status-select">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status-note">Note (Optional)</Label>
        <Input
          id="status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any relevant notes..."
          disabled={isPending}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}

      <Button type="submit" disabled={isPending || selectedStatus === currentStatus}>
        {isPending ? (
           <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          "Save Status"
        )}
      </Button>
    </form>
  );
} 