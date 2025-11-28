import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import PageAwareDataLoader from "@/components/page-aware-data-loader";

export const dynamic = "force-dynamic";

interface AdminAssignmentsPageProps {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const PAGE_SIZE = 15;

export default async function AdminOperationsAssignmentsPage({
  searchParams,
}: AdminAssignmentsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const session = await getServerSession(authOptions);
  const user = session?.user as any | undefined;
  const userRole = user?.role as string | undefined;

  if (!session?.user || (userRole !== Role.ADMIN && userRole !== "STAFF")) {
    redirect("/portal");
  }

  const userId = user.id as string;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Owner portal assignments view, embedded in the admin operations
            shell.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading assignments...</div>}>
        <PageAwareDataLoader
          userId={userId}
          userRole={userRole ?? ""}
          pageSize={PAGE_SIZE}
        />
      </Suspense>
    </div>
  );
}


