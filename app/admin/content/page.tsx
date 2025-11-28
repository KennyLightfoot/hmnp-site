import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import { ContentAdminPage } from "@/components/admin/ContentAdminPage";
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { ContentStatsPayload } from "@/lib/services/admin-metrics";

export const dynamic = 'force-dynamic';

interface ContentStatsResponse {
  success: boolean;
  data: ContentStatsPayload;
}

interface ContentJobsResponse {
  success: boolean;
  jobs: any[];
}

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session?.user || userRole !== Role.ADMIN) {
    redirect('/portal');
  }

  const [{ data }, jobsResponse] = await Promise.all([
    fetchAdminJson<ContentStatsResponse>("/api/admin/content/stats"),
    fetchAdminJson<ContentJobsResponse>("/api/admin/content/jobs"),
  ]);

  const totalViews = (jobsResponse.jobs ?? []).reduce((sum, job) => sum + (job.views ?? 0), 0);
  const totalLeads = (jobsResponse.jobs ?? []).reduce((sum, job) => sum + (job.leadsCaptured ?? 0), 0);

  return (
    <ContentAdminPage
      stats={{
        pendingReviewCount: data.pendingReviewCount,
        syncedBlogCount: data.syncedBlogCount,
        publishedTodayCount: data.publishedTodayCount,
        totalViews,
        totalLeads,
      }}
      agentsStatus={data.agentsStatus}
      jobs={jobsResponse.jobs ?? []}
    />
  );
}
