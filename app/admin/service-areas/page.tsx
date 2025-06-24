import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import ServiceAreasClient from './ServiceAreasClient';

export default async function ServiceAreasPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/portal');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage geographic service areas with polygon boundaries and pricing multipliers.
        </p>
      </div>
      
      <ServiceAreasClient />
    </div>
  );
} 