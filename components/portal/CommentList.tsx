import { User, Comment } from "@/lib/prisma-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Define the expected shape of a comment object including the author
type CommentWithAuthor = Comment & {
  author: User | null; // Author might be null if user is deleted?
};

interface CommentListProps {
  comments: CommentWithAuthor[];
}

// Helper function to format dates (consider moving to a shared util)
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString(); // Or use date-fns for more control
};

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No comments have been added yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author?.image ?? undefined} alt={comment.author?.name ?? "User"} />
            <AvatarFallback>
              {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {comment.author?.name || comment.author?.email || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(comment.createdAt)}
              </p>
            </div>
             {/* Use whitespace-pre-wrap to respect line breaks in the comment */}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 