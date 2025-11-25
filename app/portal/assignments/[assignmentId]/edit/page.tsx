import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from 'next/navigation';
import { Role } from "@/lib/prisma-types";
import { prisma } from "@/lib/db";
import { AssignmentForm } from "@/components/portal/AssignmentForm";

type EditAssignmentPageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;
  const { assignmentId } = resolvedParams;

  // Authorization Check: Only Staff/Admin can edit assignments
  const userRole = session?.user?.role;
  if (!session?.user || (userRole !== Role.ADMIN && userRole !== Role.STAFF)) {
    redirect('/portal'); // Or /unauthorized
  }

  // Fetch the existing assignment data
  let assignment: any | null = null;
  try {
    assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
       // Select all fields needed by the form
      // Prisma select default includes all scalar fields
    });
  } catch (error) {
    console.error(`Failed to fetch assignment ${assignmentId} for editing:`, error);
    return <p className="text-red-500">Error loading assignment data.</p>;
  }

  // If assignment not found
  if (!assignment) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Assignment</h1>
      <div className="max-w-2xl"> {/* Limit form width */} 
         <AssignmentForm initialData={assignment} />
      </div>
    </div>
  );
} 