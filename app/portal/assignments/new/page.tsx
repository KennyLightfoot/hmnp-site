import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import { AssignmentForm } from "@/components/portal/AssignmentForm";

export default async function NewAssignmentPage() {
    const session = await getServerSession(authOptions);

    // Authorization Check: Only Staff/Admin can create assignments
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== Role.ADMIN && userRole !== Role.STAFF)) {
        redirect('/portal'); // Or /unauthorized
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-4">Create New Assignment</h1>
            <div className="max-w-2xl"> {/* Limit form width */} 
                <AssignmentForm />
            </div>
        </div>
    );
} 