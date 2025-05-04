'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have shadcn toast setup

interface CommentFormProps {
  assignmentId: string;
}

export function CommentForm({ assignmentId }: CommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast(); // Use toast for feedback

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim()) {
      setError('Comment cannot be empty.'); // Basic client-side validation
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Success
      setCommentText(''); // Clear the textarea
      toast({ // Show success toast
        title: "Comment Added",
        description: "Your comment has been successfully submitted.",
      });
      router.refresh(); // Refresh server components to show the new comment

    } catch (err: any) {
      console.error("Comment submission error:", err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
       toast({ // Show error toast
        variant: "destructive",
        title: "Error Adding Comment",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your comment here..."
        value={commentText}
        onChange={(e) => {
          setCommentText(e.target.value);
          if (error) setError(null); // Clear error when user types
        }}
        disabled={isSubmitting}
        rows={4}
        required
      />
       {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
        {isSubmitting ? 'Submitting...' : 'Add Comment'}
      </Button>
    </form>
  );
} 