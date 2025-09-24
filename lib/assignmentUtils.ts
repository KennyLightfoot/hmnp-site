import { AssignmentStatus } from "@prisma/client";
import { type VariantProps } from "class-variance-authority"; // Import VariantProps
import { badgeVariants } from "@/components/ui/badge"; // Import badgeVariants type source if needed

// Helper function to format dates (optional, can move to utils)
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return "-";
  // Consistent date formatting
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch (e) {
     console.error("Error formatting date:", date, e);
     return "Invalid Date";
  }
};

export const formatDateShort = (date: Date | string | null | undefined): string => {
   if (!date) return "-";
  try {
     return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
     console.error("Error formatting date:", date, e);
     return "Invalid Date";
  }
};

// Type for the return value of getStatusBadgeStyle
// We use VariantProps to get the correct type for the variant property
type BadgeStyle = {
  variant: VariantProps<typeof badgeVariants>["variant"];
  className: string;
};

// Helper function to get badge variant AND specific color classes based on status
export const getStatusBadgeStyle = (status: AssignmentStatus): BadgeStyle => {
  switch (status) {
    case AssignmentStatus.REQUESTED:
      // Yellow/Orange-ish - Using outline as base
      return { variant: "outline", className: "border-yellow-500 text-yellow-600 dark:border-yellow-700 dark:text-yellow-500" };
    case AssignmentStatus.SCHEDULED:
      // Blue-ish - Using secondary as base
      return { variant: "secondary", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    case AssignmentStatus.IN_PROGRESS:
       // Slightly darker blue - Using default as base
      return { variant: "default", className: "bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700" };
    case AssignmentStatus.SIGNED:
      // Purple/Indigo-ish - Using default as base
      return { variant: "default", className: "bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700" };
    case AssignmentStatus.RETURNED_TO_TITLE:
       // Gray - Using secondary as base (already good)
      return { variant: "secondary", className: "" }; // Keep default secondary
    case AssignmentStatus.COMPLETED:
      // Green - Using default as base
      return { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700" };
    case AssignmentStatus.ARCHIVED:
      // Red - Using destructive as base (already good)
      return { variant: "destructive", className: "" }; // Keep default destructive
    default:
      return { variant: "outline", className: "" }; // Keep default outline
  }
}; 