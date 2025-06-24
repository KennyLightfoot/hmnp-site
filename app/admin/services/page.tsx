import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/portal');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Services & Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your service offerings, pricing, and Texas RON compliance settings.
        </p>
      </div>
      
      <ServicesClient />
    </div>
  );
} 