import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  JobOfferStatus,
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
import Link from "next/link"
import { formatDateTime } from "@/lib/utils/date-utils"

type JobFilter = "needs-action" | "pending" | "assigned" | "expired"

const FILTERS: { id: JobFilter; label: string; description: string }[] = [
  { id: "needs-action", label: "Needs Action", description: "No accepted offers" },
  { id: "pending", label: "Pending Offers", description: "Awaiting responses" },
  { id: "assigned", label: "Assigned", description: "Accepted by network" },
  { id: "expired", label: "Expired", description: "All offers expired" },
]

type JobOfferStatusValue = (typeof JobOfferStatus)[keyof typeof JobOfferStatus]

const relativeTime = (date: Date | string | null | undefined) => {
  if (!date) return "-"
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const direction = diffMinutes >= 0 ? "ago" : "from now"
  const absMinutes = Math.abs(diffMinutes)
  if (absMinutes < 60) {
    return `${absMinutes}m ${direction}`
  }
  const diffHours = Math.round(absMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ${direction}`
  }
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ${direction}`
}

const jobOffersSummary = (offers: { status: JobOfferStatusValue }[]) => {
  const pending = offers.filter((offer) => offer.status === JobOfferStatus.PENDING).length
  const accepted = offers.filter((offer) => offer.status === JobOfferStatus.ACCEPTED).length
  const expired = offers.filter((offer) => offer.status === JobOfferStatus.EXPIRED).length
  const declined = offers.filter((offer) => offer.status === JobOfferStatus.DECLINED).length
  return `${pending} pending • ${accepted} accepted • ${expired} expired • ${declined} declined`
}

export default async function NetworkJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal")
  }

  const params = await searchParams
  const rawFilter = params?.filter
  const filterValue = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter
  const currentFilter: JobFilter =
    filterValue && FILTERS.some((tab) => tab.id === filterValue)
      ? (filterValue as JobFilter)
      : "needs-action"

  const baseWhere: Prisma.BookingWhereInput = {
    sendToNetwork: true,
  }

  const jobOfferFilter: Prisma.BookingWhereInput["jobOffers"] = (() => {
    switch (currentFilter) {
      case "pending":
        return { some: { status: JobOfferStatus.PENDING } }
      case "assigned":
        return { some: { status: JobOfferStatus.ACCEPTED } }
      case "expired":
        return { some: { status: JobOfferStatus.EXPIRED } }
      case "needs-action":
      default:
        return {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        }
    }
  })()

  const where: Prisma.BookingWhereInput = {
    ...baseWhere,
    ...(jobOfferFilter ? { jobOffers: jobOfferFilter } : {}),
  }

  type JobOfferWithNotary = Prisma.JobOfferGetPayload<{
    select: {
      id: true
      status: true
      createdAt: true
      expiresAt: true
      Notary: {
        select: {
          name: true
          email: true
        }
      }
    }
  }>

  type BookingWithOffers = Prisma.BookingGetPayload<{
    select: {
      id: true
      status: true
      customerName: true
      customerEmail: true
      scheduledDateTime: true
      locationType: true
      networkOfferExpiresAt: true
      createdAt: true
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
          Notary: {
            select: {
              name: true
              email: true
            }
          }
        }
      }
    }
  }>

  const [
    needsActionCount,
    pendingCount,
    assignedCount,
    expiredCount,
    bookings,
  ] = await Promise.all([
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
        currentFilter === "assigned"
          ? { scheduledDateTime: "asc" }
          : { networkOfferExpiresAt: "asc" },
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
  ]) as [number, number, number, number, BookingWithOffers[]]

  const tabCounts: Record<JobFilter, number> = {
    "needs-action": needsActionCount,
    pending: pendingCount,
    assigned: assignedCount,
    expired: expiredCount,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Network Job Queue</h1>
        <p className="text-muted-foreground">
          Detailed view of bookings routed to the notary network, offer status, and follow-up actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select a queue to focus on.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {FILTERS.map((tab) => {
              const active = tab.id === currentFilter
              return (
                <Link
                  key={tab.id}
                  href={`/admin/network/jobs?filter=${tab.id}`}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold">
                    {tab.label} • {tabCounts[tab.id]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tab.description}
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {FILTERS.find((tab) => tab.id === currentFilter)?.label} Jobs
          </CardTitle>
          <CardDescription>
            Showing up to 50 bookings (sorted by urgency).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookings match this filter right now.
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
                    <TableHead>Offer Summary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const acceptedOffer = (booking.jobOffers as JobOfferWithNotary[]).find(
                      (offer) => offer.status === JobOfferStatus.ACCEPTED,
                    )
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="text-primary hover:underline"
                          >
                            #{booking.id.slice(-6)}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Created {relativeTime(booking.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.customerName || booking.customerEmail || "Unknown customer"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {booking.service?.name ?? "—"}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {booking.jobOffers.length} offers generated
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatDateTime(booking.scheduledDateTime)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Expires{" "}
                            {formatDateTime(booking.networkOfferExpiresAt)}
                          </p>
                        </TableCell>
                        <TableCell className="capitalize">
                          {booking.locationType?.toLowerCase() ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {jobOffersSummary(booking.jobOffers)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last offer{" "}
                            {booking.jobOffers[0]
                              ? relativeTime(booking.jobOffers[0].createdAt)
                              : "n/a"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline">{booking.status}</Badge>
                            {acceptedOffer ? (
                              <p className="text-xs text-muted-foreground">
                                Assigned to {acceptedOffer.Notary?.name ?? "Unknown"}{" "}
                                ({acceptedOffer.Notary?.email ?? "n/a"})
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Awaiting acceptance
                              </p>
                            )}
                          </div>
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
    </div>
  )
}

