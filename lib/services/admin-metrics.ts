import { cache, cacheTTL } from "@/lib/cache";
import { prisma } from "@/lib/db";
import {
  JobOfferStatus,
  NotaryApplicationStatus,
  NotaryAvailabilityStatus,
  NotaryOnboardingStatus,
  Role,
} from "@/lib/prisma-types";
import { listReviewJobs } from "@/lib/agents-client";
import { runQuickHealthCheck, runSystemTests } from "@/lib/testing/system-tests";
import { getErrorMessage } from "@/lib/utils/error-utils";

type DecimalLike = number | { toNumber: () => number } | null | undefined;

function decimalToNumber(value: DecimalLike): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function getPendingContentReviews(): Promise<number> {
  try {
    const reviewJobs = await listReviewJobs({
      status: "PENDING_REVIEW",
      contentType: "BLOG",
      limit: 1,
    });
    if (reviewJobs.ok) {
      return reviewJobs.count;
    }
    return 0;
  } catch {
    return 0;
  }
}

const dashboardCacheKey = "admin:dashboard:overview";

export interface DashboardCardMetric {
  label: string;
  value: number | string;
  description?: string;
}

export interface AdminDashboardOverview {
  timestamp: string;
  totals: {
    totalBookings: number;
    pendingBookings: number;
    totalClients: number;
    totalRevenue: number;
  };
  notifications: {
    scheduled: number;
    activeAlerts: number;
  };
  content: {
    pendingReviews: number;
  };
  network: {
    totalApplications: number;
    statusCounts: Record<string, number>;
    applicationsLast7Days: number;
    approvedReadyCount: number;
    convertedLast30Days: number;
    activeNotaries: number;
    totalOnboardedNotaries: number;
    openNetworkJobs: number;
    pendingJobOffers: number;
    expiringSoonOffers: number;
    jobOfferAcceptanceRate: number;
    expiredOffersLast24h: number;
  };
  jobOffers: {
    offersCreated7d: number;
    offersAccepted7d: number;
  };
}

export interface AdminOperationsMetrics {
  timestamp: string;
  totals: {
    totalAutomationLeads: number;
    automationLeads24h: number;
    automationJobs24h: number;
    automationJobsPending: number;
    pricingQuotesNeedingReview: number;
  };
  latestJobs: Array<{
    jobId: string | null;
    serviceType: string | null;
    status: string | null;
    confirmedPrice: number | null;
    appointmentDateTime: string | null;
    createdAt: string;
  }>;
  autopilot: {
    sentLast24h: number;
    failedLast24h: number;
    pendingReview: number;
    lastRunAt?: string | null;
  };
  reviewQueue: Array<{
    id: string;
    scenario: string;
    riskLevel: string;
    createdAt: string;
    message: {
      id: string;
      bookingId: string | null;
      subject: string | null;
      body: string;
      recipientEmail: string | null;
      messageType: string;
    };
  }>;
}

export interface NetworkDashboardMetrics {
  generatedAt: string;
  applications: {
    total: number;
    statuses: Record<string, number>;
    newLast7Days: number;
    approvedReady: number;
    convertedLast30Days: number;
    recent: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      statesLicensed: string[];
      serviceTypes: string[];
      status: string;
      createdAt: string;
    }>;
  };
  notaries: {
    active: number;
    totalOnboarded: number;
    unavailable: number;
    statesCovered: number;
    languages: Array<[string, number]>;
  };
  jobs: {
    openNetworkJobs: number;
    pendingOffers: number;
    expiringSoon: number;
    expiredLast24h: number;
    acceptanceRate7d: number;
    open: Array<{
      id: string;
      customerName: string | null;
      status: string;
      locationType: string | null;
      scheduledDateTime: string | null;
      networkOfferExpiresAt: string | null;
      serviceName: string | null;
      offers: number;
    }>;
  };
  automation: {
    jobs24h: number;
    jobsPending: number;
    recentJobs: Array<{
      jobId: string | null;
      serviceType: string | null;
      status: string | null;
      confirmedPrice: number | null;
      createdAt: string;
    }>;
  };
}

export type NetworkJobFilter = "needs-action" | "pending" | "assigned" | "expired";

export interface NetworkJobsPayload {
  filter: NetworkJobFilter;
  counts: Record<NetworkJobFilter, number>;
  jobs: Array<{
    id: string;
    status: string;
    customerName: string | null;
    customerEmail: string | null;
    scheduledDateTime: string | null;
    locationType: string | null;
    networkOfferExpiresAt: string | null;
    createdAt: string;
    serviceName: string | null;
    jobOffers: Array<{
      id: string;
      status: string;
      createdAt: string;
      expiresAt: string | null;
      notaryName: string | null;
      notaryEmail: string | null;
    }>;
  }>;
}

export interface AdminBillingMetrics {
  timestamp: string;
  totals: {
    revenueAllTime: number;
    pendingCount: number;
    failedCount: number;
  };
  payments: Array<{
    id: string;
    bookingId: string | null;
    status: string;
    amount: number;
    provider: string | null;
    createdAt: string;
  }>;
}

export interface SystemHealthSection {
  id: string;
  label: string;
  status: "PASS" | "WARN" | "FAIL" | "UNKNOWN";
  tests: Array<{
    name: string;
    status: "PASS" | "WARN" | "FAIL";
  }>;
}

export interface SystemHealthSummary {
  generatedAt: string;
  quick: {
    status: string;
    database?: boolean;
    cache?: boolean;
    queues?: boolean;
    error?: string;
  };
  full?: {
    passed: number;
    warnings: number;
    failed: number;
    durationMs?: number;
    summary?: string;
  };
  sections: SystemHealthSection[];
}

export interface ContentStatsPayload {
  pendingReviewCount: number;
  syncedBlogCount: number;
  publishedTodayCount: number;
  agentsStatus: {
    reachable: boolean;
    error?: string;
  };
}

export async function getDashboardOverviewData(): Promise<AdminDashboardOverview> {
  const cached = await cache.get<AdminDashboardOverview>(dashboardCacheKey);
  if (cached) {
    return cached;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const [
    totalBookings,
    pendingBookings,
    totalClients,
    totalRevenue,
    scheduledNotifications,
    activeAlerts,
    applicationStatusGroups,
    applicationsLast7Days,
    approvedNotConvertedCount,
    convertedLast30Days,
    activeNotariesCount,
    totalOnboardedNotaries,
    openNetworkJobs,
    pendingJobOffers,
    expiringJobOffersSoon,
    offersLast7Days,
    acceptedOffersLast7Days,
    expiredOffersLast24h,
    pendingContentReviews,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        status: { in: ["REQUESTED", "PAYMENT_PENDING"] },
      },
    }),
    prisma.user.count({
      where: { role: Role.SIGNER },
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.notificationLog.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.systemAlert.count({
      where: { status: "ACTIVE" },
    }),
    prisma.notaryApplication.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.notaryApplication.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.APPROVED,
        convertedToUserId: null,
      },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.CONVERTED,
        convertedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
        availability_status: NotaryAvailabilityStatus.AVAILABLE,
        is_active: true,
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
      },
    }),
    prisma.booking.count({
      where: {
        sendToNetwork: true,
        jobOffers: {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
          lte: fifteenMinutesFromNow,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.ACCEPTED,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.EXPIRED,
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    getPendingContentReviews(),
  ]);

  type ApplicationStatusGroup = { status: NotaryApplicationStatus; _count: { _all: number } };

  const applicationStatusMap = (applicationStatusGroups as ApplicationStatusGroup[]).reduce<Record<string, number>>(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    {},
  );

  const jobOfferAcceptanceRate =
    offersLast7Days === 0 ? 0 : Math.round((acceptedOffersLast7Days / offersLast7Days) * 100);

  const overview: AdminDashboardOverview = {
    timestamp: now.toISOString(),
    totals: {
      totalBookings,
      pendingBookings,
      totalClients,
      totalRevenue: decimalToNumber(totalRevenue?._sum?.amount),
    },
    notifications: {
      scheduled: scheduledNotifications,
      activeAlerts,
    },
    content: {
      pendingReviews: pendingContentReviews,
    },
    network: {
      totalApplications: Object.values(applicationStatusMap).reduce((sum, count) => sum + count, 0),
      statusCounts: applicationStatusMap,
      applicationsLast7Days,
      approvedReadyCount: approvedNotConvertedCount,
      convertedLast30Days,
      activeNotaries: activeNotariesCount,
      totalOnboardedNotaries,
      openNetworkJobs,
      pendingJobOffers,
      expiringSoonOffers: expiringJobOffersSoon,
      jobOfferAcceptanceRate,
      expiredOffersLast24h,
    },
    jobOffers: {
      offersCreated7d: offersLast7Days,
      offersAccepted7d: acceptedOffersLast7Days,
    },
  };

  await cache.set(dashboardCacheKey, overview, {
    ttl: cacheTTL.short,
    tags: ["admin", "dashboard", "analytics"],
  });

  return overview;
}

export async function getOperationsMetricsData(): Promise<AdminOperationsMetrics> {
  const now = Date.now();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

  const [
    totalAutomationLeads,
    automationLeads24h,
    automationJobs24h,
    automationJobsPending,
    pricingQuotesNeedingReview,
    latestAutomationJobsRaw,
    sentAutopilot24h,
    failedAutopilot24h,
    pendingReviews,
    lastAutopilotMessage,
    reviewQueueRaw,
  ] = await Promise.all([
    (prisma as any).agentLead.count(),
    (prisma as any).agentLead.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    (prisma as any).agentJob.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    (prisma as any).agentJob.count({
      where: {
        status: {
          in: ["PENDING", "PENDING_REVIEW", "IN_PROGRESS"],
        },
      },
    }),
    (prisma as any).agentPricingQuote.count({
      where: {
        needsReview: true,
      },
    }),
    (prisma as any).agentJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        jobId: true,
        serviceType: true,
        status: true,
        confirmedPrice: true,
        appointmentDateTime: true,
        createdAt: true,
      },
    }),
    (prisma as any).outboundMessage.count({
      where: {
        status: "SENT",
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    (prisma as any).outboundMessage.count({
      where: {
        status: "FAILED",
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    (prisma as any).messageReview.count({
      where: {
        status: "PENDING",
      },
    }),
    (prisma as any).outboundMessage.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    (prisma as any).messageReview.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        scenario: true,
        riskLevel: true,
        createdAt: true,
        message: {
          select: {
            id: true,
            bookingId: true,
            subject: true,
            body: true,
            recipientEmail: true,
            messageType: true,
          },
        },
      },
    }),
  ]);

  const latestAutomationJobs = latestAutomationJobsRaw.map((job: any) => ({
    jobId: job.jobId,
    serviceType: job.serviceType,
    status: job.status,
    confirmedPrice: job.confirmedPrice ? decimalToNumber(job.confirmedPrice) : null,
    appointmentDateTime: job.appointmentDateTime ? job.appointmentDateTime.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
  }));

  return {
    timestamp: new Date().toISOString(),
    totals: {
      totalAutomationLeads,
      automationLeads24h,
      automationJobs24h,
      automationJobsPending,
      pricingQuotesNeedingReview,
    },
    latestJobs: latestAutomationJobs,
    autopilot: {
      sentLast24h: sentAutopilot24h,
      failedLast24h: failedAutopilot24h,
      pendingReview: pendingReviews,
      lastRunAt: lastAutopilotMessage?.updatedAt?.toISOString() ?? null,
    },
    reviewQueue: reviewQueueRaw.map((review: any) => ({
      id: review.id,
      scenario: review.scenario,
      riskLevel: review.riskLevel,
      createdAt: review.createdAt.toISOString(),
      message: {
        id: review.message.id,
        bookingId: review.message.bookingId,
        subject: review.message.subject,
        body: review.message.body,
        recipientEmail: review.message.recipientEmail,
        messageType: review.message.messageType,
      },
    })),
  };
}

export async function getNetworkDashboardData(): Promise<NetworkDashboardMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const [
    applicationGroups,
    applicationsLast7Days,
    approvedReadyCount,
    convertedRecentCount,
    activeNotariesCount,
    totalNotariesCount,
    unavailableNotariesCount,
    notaryCoverageRows,
    openNetworkJobsCount,
    pendingJobOffersCount,
    expiringJobOffersSoonCount,
    expiredOffersLast24hCount,
    offersLastSevenDaysCount,
    acceptedOffersLastSevenDaysCount,
    openJobsRaw,
    recentApplicationsRaw,
    automationJobs24hCount,
    automationJobsPendingCount,
    recentAutomationJobsRaw,
  ] = await Promise.all([
    prisma.notaryApplication.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.notaryApplication.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.APPROVED,
        convertedToUserId: null,
      },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.CONVERTED,
        convertedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
        availability_status: NotaryAvailabilityStatus.AVAILABLE,
        is_active: true,
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
        availability_status: {
          in: [
            NotaryAvailabilityStatus.BUSY,
            NotaryAvailabilityStatus.UNAVAILABLE,
            NotaryAvailabilityStatus.ON_LEAVE,
          ],
        },
      },
    }),
    prisma.notary_profiles.findMany({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
      },
      select: {
        states_licensed: true,
        languages_spoken: true,
      },
    }),
    prisma.booking.count({
      where: {
        sendToNetwork: true,
        jobOffers: {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
          lte: fifteenMinutesFromNow,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.EXPIRED,
        updatedAt: { gte: twentyFourHoursAgo },
      },
    }),
    prisma.jobOffer.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.ACCEPTED,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.booking.findMany({
      where: {
        sendToNetwork: true,
        jobOffers: {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
      orderBy: [
        { networkOfferExpiresAt: "asc" },
        { createdAt: "desc" },
      ],
      take: 8,
      select: {
        id: true,
        customerName: true,
        status: true,
        locationType: true,
        scheduledDateTime: true,
        networkOfferExpiresAt: true,
        service: {
          select: {
            name: true,
          },
        },
        jobOffers: {
          select: { id: true },
        },
      },
    }),
    prisma.notaryApplication.findMany({
      where: {
        status: {
          in: [
            NotaryApplicationStatus.PENDING,
            NotaryApplicationStatus.UNDER_REVIEW,
            NotaryApplicationStatus.APPROVED,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        statesLicensed: true,
        serviceTypes: true,
        status: true,
        createdAt: true,
      },
    }),
    (prisma as any).agentJob.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
    (prisma as any).agentJob.count({
      where: {
        status: {
          in: ["PENDING", "PENDING_REVIEW", "IN_PROGRESS"],
        },
      },
    }),
    (prisma as any).agentJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        jobId: true,
        serviceType: true,
        status: true,
        confirmedPrice: true,
        createdAt: true,
      },
    }),
  ]);

  type ApplicationStatusGroup = { status: NotaryApplicationStatus; _count: { _all: number } };

  const applicationStatusMap = (applicationGroups as ApplicationStatusGroup[]).reduce<Record<string, number>>(
    (acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    },
    {},
  );

  const stateSet = new Set<string>();
  const languageCounts: Record<string, number> = {};

  type NotaryCoverageRow = {
    states_licensed?: string[] | null;
    languages_spoken?: string[] | null;
  };

  notaryCoverageRows.forEach((row: NotaryCoverageRow) => {
    row.states_licensed?.forEach((state: string) => stateSet.add(state));
    row.languages_spoken?.forEach((language: string) => {
      languageCounts[language] = (languageCounts[language] || 0) + 1;
    });
  });

  const jobOfferAcceptanceRate =
    offersLastSevenDaysCount === 0
      ? 0
      : Math.round((acceptedOffersLastSevenDaysCount / offersLastSevenDaysCount) * 100);

  return {
    generatedAt: new Date().toISOString(),
    applications: {
      total: Object.values(applicationStatusMap).reduce((sum, count) => sum + count, 0),
      statuses: applicationStatusMap,
      newLast7Days: applicationsLast7Days,
      approvedReady: approvedReadyCount,
      convertedLast30Days: convertedRecentCount,
      recent: recentApplicationsRaw.map((app: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        statesLicensed: string[];
        serviceTypes: string[];
        status: string;
        createdAt: Date;
      }) => ({
        id: app.id,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        statesLicensed: app.statesLicensed,
        serviceTypes: app.serviceTypes,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    },
    notaries: {
      active: activeNotariesCount,
      totalOnboarded: totalNotariesCount,
      unavailable: unavailableNotariesCount,
      statesCovered: stateSet.size,
      languages: Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    },
    jobs: {
      openNetworkJobs: openNetworkJobsCount,
      pendingOffers: pendingJobOffersCount,
      expiringSoon: expiringJobOffersSoonCount,
      expiredLast24h: expiredOffersLast24hCount,
      acceptanceRate7d: jobOfferAcceptanceRate,
      open: openJobsRaw.map((job) => ({
        id: job.id,
        customerName: job.customerName,
        status: job.status,
        locationType: job.locationType,
        scheduledDateTime: job.scheduledDateTime ? job.scheduledDateTime.toISOString() : null,
        networkOfferExpiresAt: job.networkOfferExpiresAt ? job.networkOfferExpiresAt.toISOString() : null,
        serviceName: job.service?.name ?? null,
        offers: job.jobOffers.length,
      })),
    },
    automation: {
      jobs24h: automationJobs24hCount,
      jobsPending: automationJobsPendingCount,
      recentJobs: recentAutomationJobsRaw.map((job: any) => ({
        jobId: job.jobId,
        serviceType: job.serviceType,
        status: job.status,
        confirmedPrice: job.confirmedPrice ? decimalToNumber(job.confirmedPrice) : null,
        createdAt: job.createdAt.toISOString(),
      })),
    },
  };
}

export async function getNetworkJobsData(filter: NetworkJobFilter): Promise<NetworkJobsPayload> {
  const baseWhere = {
    sendToNetwork: true,
  };

  const jobOfferFilter = (() => {
    switch (filter) {
      case "pending":
        return { some: { status: JobOfferStatus.PENDING } };
      case "assigned":
        return { some: { status: JobOfferStatus.ACCEPTED } };
      case "expired":
        return { some: { status: JobOfferStatus.EXPIRED } };
      case "needs-action":
      default:
        return {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        };
    }
  })();

  const where = {
    ...baseWhere,
    ...(jobOfferFilter ? { jobOffers: jobOfferFilter } : {}),
  };

  const [needsActionCount, pendingCount, assignedCount, expiredCount, bookings] = await Promise.all([
    prisma.booking.count({
      where: {
        ...baseWhere,
        jobOffers: {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        jobOffers: {
          some: {
            status: JobOfferStatus.PENDING,
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        jobOffers: {
          some: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        jobOffers: {
          some: {
            status: JobOfferStatus.EXPIRED,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where,
      orderBy: [
        filter === "assigned" ? { scheduledDateTime: "asc" } : { networkOfferExpiresAt: "asc" },
        { createdAt: "desc" },
      ],
      take: 50,
      select: {
        id: true,
        status: true,
        customerName: true,
        customerEmail: true,
        scheduledDateTime: true,
        locationType: true,
        networkOfferExpiresAt: true,
        createdAt: true,
        service: {
          select: {
            name: true,
          },
        },
        jobOffers: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            expiresAt: true,
            Notary: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    filter,
    counts: {
      "needs-action": needsActionCount,
      pending: pendingCount,
      assigned: assignedCount,
      expired: expiredCount,
    },
    jobs: bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      scheduledDateTime: booking.scheduledDateTime ? booking.scheduledDateTime.toISOString() : null,
      locationType: booking.locationType,
      networkOfferExpiresAt: booking.networkOfferExpiresAt ? booking.networkOfferExpiresAt.toISOString() : null,
      createdAt: booking.createdAt.toISOString(),
      serviceName: booking.service?.name ?? null,
      jobOffers: booking.jobOffers.map((offer) => ({
        id: offer.id,
        status: offer.status,
        createdAt: offer.createdAt.toISOString(),
        expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
        notaryName: offer.Notary?.name ?? null,
        notaryEmail: offer.Notary?.email ?? null,
      })),
    })),
  };
}

export async function getBillingMetricsData(): Promise<AdminBillingMetrics> {
  const [completedAgg, failedCount, pendingCount, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { status: "FAILED" },
    }),
    prisma.payment.count({
      where: { status: "PENDING" },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        bookingId: true,
        status: true,
        amount: true,
        provider: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    timestamp: new Date().toISOString(),
    totals: {
      revenueAllTime: decimalToNumber(completedAgg._sum.amount),
      pendingCount,
      failedCount,
    },
    payments: recentPayments.map((payment) => ({
      id: payment.id,
      bookingId: payment.bookingId,
      status: payment.status,
      amount: decimalToNumber(payment.amount),
      provider: payment.provider,
      createdAt: payment.createdAt.toISOString(),
    })),
  };
}

export async function getSystemHealthSummary(): Promise<SystemHealthSummary> {
  const [health, full] = await Promise.allSettled([runQuickHealthCheck(), runSystemTests()]);

  const quickResult =
    health.status === "fulfilled"
      ? {
          status: health.value?.status ?? "unknown",
          database: health.value?.database,
          cache: health.value?.cache,
          queues: health.value?.queues,
        }
      : {
          status: "error",
          error: health.reason ? getErrorMessage(health.reason as Error) : "Quick health check failed",
        };

  const fullResult =
    full.status === "fulfilled"
      ? {
          passed: full.value?.passed ?? 0,
          warnings: full.value?.warnings ?? 0,
          failed: full.value?.failed ?? 0,
          durationMs: full.value?.duration,
          summary: full.value?.summary,
          results: full.value?.results ?? [],
        }
      : undefined;

  const sections: SystemHealthSection[] = [];

  if (fullResult?.results?.length) {
    const buildSection = (id: string, label: string, predicate: (name: string) => boolean): SystemHealthSection => {
      const tests = fullResult.results
        .filter((r: { name?: string }) => predicate(r.name?.toLowerCase?.() ?? ""))
        .map((r: { name: string; status: "PASS" | "WARN" | "FAIL" }) => ({
          name: r.name,
          status: r.status,
        }));
      const status = tests.length
        ? tests.some((t) => t.status === "FAIL")
          ? "FAIL"
          : tests.some((t) => t.status === "WARN")
          ? "WARN"
          : "PASS"
        : "UNKNOWN";
      return { id, label, status, tests };
    };

    sections.push(
      buildSection("queues", "Queues & Workers", (name) => name.includes("bullmq")),
      buildSection("agents", "Agents & AI", (name) => name.includes("agent") || name.includes("ai")),
      buildSection(
        "automations",
        "Automations & n8n",
        (name) =>
          name.includes("automation") || name.includes("webhook") || name.includes("cron") || name.includes("n8n"),
      ),
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    quick: quickResult,
    full: fullResult
      ? {
          passed: fullResult.passed,
          warnings: fullResult.warnings,
          failed: fullResult.failed,
          durationMs: fullResult.durationMs,
          summary: fullResult.summary,
        }
      : undefined,
    sections,
  };
}

export async function getContentStats(): Promise<ContentStatsPayload> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  let agentsStatus: { reachable: boolean; error?: string } = {
    reachable: true,
    error: undefined,
  };

  const [syncedBlogCount, publishedTodayCount] = await Promise.all([
    (prisma as any).agentBlog.count(),
    (prisma as any).agentBlog.count({
      where: {
        publishedAt: {
          gte: startOfDay,
        },
      },
    }),
  ]);

  try {
    const reviewJobs = await listReviewJobs({
      status: "PENDING_REVIEW",
      contentType: "BLOG",
      limit: 1,
    });
    if (!reviewJobs || !reviewJobs.ok) {
      agentsStatus = {
        reachable: false,
        error: reviewJobs?.error || "Agents review queue returned an error.",
      };
    }
    return {
      pendingReviewCount: reviewJobs?.ok ? Number(reviewJobs.count ?? 0) : 0,
      syncedBlogCount,
      publishedTodayCount,
      agentsStatus,
    };
  } catch (error) {
    agentsStatus = {
      reachable: false,
      error: getErrorMessage(error),
    };
    return {
      pendingReviewCount: 0,
      syncedBlogCount,
      publishedTodayCount,
      agentsStatus,
    };
  }
}


