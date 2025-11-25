import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  JobOfferStatus,
  NotaryApplicationStatus,
  NotaryAvailabilityStatus,
  NotaryOnboardingStatus,
  Role,
} from "@/lib/prisma-types"
import { prisma } from "@/lib/db"
import type { Prisma } from "@/lib/prisma-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  ClipboardList,
  FileText,
  Gauge,
  MapPin,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils/date-utils"

const relativeHours = (date: Date) => {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)))
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}

const timeUntil = (date: Date | null | undefined) => {
  if (!date) return "-"
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  if (diffMinutes === 0) return "now"
  if (diffMinutes > 0) {
    return diffMinutes >= 60
      ? `in ${Math.round(diffMinutes / 60)}h`
      : `in ${diffMinutes}m`
  }
  const pastMinutes = Math.abs(diffMinutes)
  return pastMinutes >= 60
    ? `${Math.round(pastMinutes / 60)}h ago`
    : `${pastMinutes}m ago`
}

export default async function AdminNetworkDashboard() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal")
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)

  type OpenJob = Prisma.BookingGetPayload<{
    select: {
      id: true
      customerName: true
      status: true
      locationType: true
      scheduledDateTime: true
      createdAt: true
      networkOfferExpiresAt: true
      service: {
        select: {
          name: true
        }
      }
      jobOffers: {
        orderBy: { createdAt: "desc" }
        select: {
          id: true
          status: true
          createdAt: true
          expiresAt: true
        }
      }
    }
  }>

  type JobOffer = Prisma.JobOfferGetPayload<{
    select: {
      id: true
      status: true
      createdAt: true
      expiresAt: true
    }
  }>

  const [
    pendingApplicationsCount,
    underReviewApplicationsCount,
    approvedReadyCount,
    convertedRecentCount,
    applicationsSevenDayCount,
    activeNotariesCount,
    totalNotariesCount,
    unavailableNotariesCount,
    openNetworkJobsCount,
    pendingJobOffersCount,
    expiringJobOffersSoonCount,
    expiredOffersLast24hCount,
    offersLastSevenDaysCount,
    acceptedOffersLastSevenDaysCount,
    openJobs,
    recentApplications,
  ] = await Promise.all([
    prisma.notaryApplication.count({
      where: { status: NotaryApplicationStatus.PENDING },
    }),
    prisma.notaryApplication.count({
      where: { status: NotaryApplicationStatus.UNDER_REVIEW },
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
    prisma.notaryApplication.count({
      where: { createdAt: { gte: sevenDaysAgo } },
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
        updatedAt: {
          gte: twentyFourHoursAgo,
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
      take: 10,
      select: {
        id: true,
        customerName: true,
        status: true,
        locationType: true,
        scheduledDateTime: true,
        createdAt: true,
        networkOfferExpiresAt: true,
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
          },
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
  ]) as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    OpenJob[],
    Prisma.NotaryApplicationGetPayload<{
      select: {
        id: true
        firstName: true
        lastName: true
        email: true
        statesLicensed: true
        serviceTypes: true
        status: true
        createdAt: true
      }
    }>[]
  ]

  const jobOfferAcceptanceRate =
    offersLastSevenDaysCount === 0
      ? 0
      : Math.round(
          (acceptedOffersLastSevenDaysCount / offersLastSevenDaysCount) * 100,
        )

  const kpiCards = [
    {
      title: "New Applications (7d)",
      value: applicationsSevenDayCount.toString(),
      description: `${pendingApplicationsCount} pending review`,
      icon: FileText,
    },
    {
      title: "Under Review",
      value: underReviewApplicationsCount.toString(),
      description: `${approvedReadyCount} approved & waiting conversion`,
      icon: ClipboardList,
    },
    {
      title: "Converted (30d)",
      value: convertedRecentCount.toString(),
      description: `${jobOfferAcceptanceRate}% job offer acceptance (7d)`,
      icon: Activity,
    },
    {
      title: "Active Notaries",
      value: activeNotariesCount.toString(),
      description: `of ${totalNotariesCount} onboarded • ${unavailableNotariesCount} unavailable`,
      icon: UserCheck,
    },
    {
      title: "Open Network Jobs",
      value: openNetworkJobsCount.toString(),
      description: `${pendingJobOffersCount} pending offers • ${expiringJobOffersSoonCount} expiring <15m`,
      icon: MapPin,
    },
    {
      title: "Expired Offers (24h)",
      value: expiredOffersLast24hCount.toString(),
      description: `${acceptedOffersLastSevenDaysCount}/${offersLastSevenDaysCount} accepted (7d)`,
      icon: Gauge,
    },
  ]

  const applicationPipeline = [
    { label: "Pending", value: pendingApplicationsCount },
    { label: "Under Review", value: underReviewApplicationsCount },
    { label: "Approved (ready)", value: approvedReadyCount },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Network Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Hiring pipeline, coverage health, and open job flow across the
          notary network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                {card.title}
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Open Network Jobs</CardTitle>
                <CardDescription>
                  Bookings sent to the network without an accepted offer
                </CardDescription>
              </div>
              <Link
                href="/admin/network/jobs"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all jobs →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {openJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open network jobs right now. All bookings have an assigned
                notary.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openJobs.map((job) => {
                      const pendingOffers = (job.jobOffers as JobOffer[]).filter(
                        (offer) => offer.status === JobOfferStatus.PENDING,
                      ).length
                      const totalOffers = job.jobOffers.length
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/admin/bookings/${job.id}`}
                              className="text-primary hover:underline"
                            >
                              #{job.id.slice(-6)}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {relativeHours(job.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {job.service?.name ?? "—"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {job.status}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDateTime(job.scheduledDateTime)}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {job.locationType?.toLowerCase() ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {pendingOffers}/{totalOffers} pending
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Last offer{" "}
                              {job.jobOffers[0]
                                ? relativeHours(job.jobOffers[0].createdAt)
                                : "n/a"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {formatDateTime(job.networkOfferExpiresAt)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {timeUntil(job.networkOfferExpiresAt)}
                            </p>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
            <CardDescription>
              Snapshot of candidates moving through the hiring funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {applicationPipeline.map((stage) => (
                <div
                  key={stage.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{stage.label}</span>
                  <span className="font-semibold">{stage.value}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Recent Applications</h4>
                <Link
                  href="/admin/notary-applications"
                  className="text-xs text-primary hover:underline"
                >
                  Manage all →
                </Link>
              </div>
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {application.firstName} {application.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.statesLicensed.slice(0, 2).join(", ") ||
                            "States not provided"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {application.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {application.serviceTypes.slice(0, 2).join(", ") ||
                        "Service types not provided"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied {relativeHours(new Date(application.createdAt))}
                    </p>
                  </div>
                ))}
                {recentApplications.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No applications in the queue.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

