import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  JobOfferStatus,
  NotaryApplicationStatus,
  NotaryAvailabilityStatus,
  NotaryOnboardingStatus,
} from "@/lib/prisma-types"
import type { Prisma } from "@/lib/prisma-types"
import { prisma } from "@/lib/database-connection"
import { cache, cacheTTL } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { getErrorMessage } from "@/lib/utils/error-utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    if (!session?.user || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cacheKey = "admin:network-dashboard:stats"
    const cached = await cache.get(cacheKey)
    if (cached) {
      logger.info("Network dashboard data served from cache", "NETWORK_DASHBOARD")
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      })
    }

    const data = await getNetworkDashboardData()
    await cache.set(cacheKey, data, {
      ttl: cacheTTL.short,
      tags: ["admin", "network-dashboard"],
    })

    return NextResponse.json({
      success: true,
      data,
      cached: false,
    })
  } catch (error) {
    logger.error("Network dashboard API error", "NETWORK_DASHBOARD", error as Error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch network dashboard data",
        message: error instanceof Error ? getErrorMessage(error) : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function getNetworkDashboardData() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)

  const [
    applicationGroups,
    applicationsLast7Days,
    approvedReadyCount,
    convertedLast30Days,
    activeNotariesCount,
    totalOnboardedNotaries,
    unavailableNotariesCount,
    notaryCoverageRows,
    openNetworkJobsCount,
    pendingJobOffersCount,
    expiringJobOffersSoonCount,
    expiredOffersLast24hCount,
    offersLast7DaysCount,
    acceptedOffersLast7DaysCount,
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
    }) as Promise<Array<{ states_licensed: string[]; languages_spoken: string[] }>>,
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
  ])

  type ApplicationStatusGroup = { status: NotaryApplicationStatus; _count: { _all: number } };
  
  const applicationStatusMap = (applicationGroups as ApplicationStatusGroup[]).reduce<Record<string, number>>(
    (acc: Record<string, number>, group: ApplicationStatusGroup) => {
      acc[group.status] = group._count._all
      return acc
    },
    {} as Record<string, number>
  )

  const totalApplications = Object.values(applicationStatusMap).reduce(
    (sum, count) => sum + count,
    0,
  )

  const stateSet = new Set<string>()
  const languageCounts: Record<string, number> = {}

  type NotaryCoverageRow = { states_licensed: string[]; languages_spoken: string[] };
  
  (notaryCoverageRows as NotaryCoverageRow[]).forEach((row) => {
    (row.states_licensed as string[]).forEach((state: string) => stateSet.add(state));
    (row.languages_spoken as string[]).forEach((language: string) => {
      languageCounts[language] = (languageCounts[language] || 0) + 1
    })
  })

  const jobOfferAcceptanceRate =
    offersLast7DaysCount === 0
      ? 0
      : Math.round((acceptedOffersLast7DaysCount / offersLast7DaysCount) * 100)

  return {
    generatedAt: new Date().toISOString(),
    applications: {
      total: totalApplications,
      statuses: applicationStatusMap,
      newLast7Days: applicationsLast7Days,
      approvedReady: approvedReadyCount,
      convertedLast30Days,
    },
    notaries: {
      active: activeNotariesCount,
      totalOnboarded: totalOnboardedNotaries,
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
    },
  }
}

