import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/portal');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & KPIs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Business intelligence dashboard with revenue analytics, margin calculations, and performance insights.
        </p>
      </div>
      
      <AnalyticsClient />
    </div>
  );
} 