import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  NotaryAvailabilityStatus,
  NotaryOnboardingStatus,
  Role,
} from "@/lib/prisma-types"
import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type StateSummary = {
  total: number
  available: number
  busy: number
  totalRadius: number
  radiusSamples: number
  counties: Record<string, number>
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value)

// Local view-model type for notary profiles; matches the select clause below.
type NotaryProfile = {
  id: string
  user_id: string
  onboarding_status: NotaryOnboardingStatus
  availability_status: NotaryAvailabilityStatus
  service_radius_miles: number | null
  states_licensed: any
  counties_served: any
  languages_spoken: any
  years_experience: number | null
  preferred_service_types: any
  User: { name: string | null; email: string | null } | null
  updated_at: Date
}

export default async function NetworkCoveragePage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal")
  }

  const notaryProfiles: NotaryProfile[] = await prisma.notary_profiles.findMany({
    orderBy: { updated_at: "desc" },
    where: {
      onboarding_status: {
        in: [
          NotaryOnboardingStatus.IN_PROGRESS,
          NotaryOnboardingStatus.DOCUMENTS_PENDING,
          NotaryOnboardingStatus.COMPLETE,
        ],
      },
    },
    select: {
      id: true,
      user_id: true,
      onboarding_status: true,
      availability_status: true,
      service_radius_miles: true,
      states_licensed: true,
      counties_served: true,
      languages_spoken: true,
      years_experience: true,
      preferred_service_types: true,
      User: {
        select: {
          name: true,
          email: true,
        },
      },
      updated_at: true,
    },
  })

  const totalNotaries = notaryProfiles.length
  const availableNotaries = notaryProfiles.filter(
    (profile) => profile.availability_status === NotaryAvailabilityStatus.AVAILABLE,
  ).length
  const busyNotaries = notaryProfiles.filter(
    (profile) => profile.availability_status === NotaryAvailabilityStatus.BUSY,
  ).length
  const unavailableNotaries = notaryProfiles.filter(
    (profile) =>
      profile.availability_status === NotaryAvailabilityStatus.UNAVAILABLE ||
      profile.availability_status === NotaryAvailabilityStatus.ON_LEAVE,
  ).length

  const stateSummaries: Record<string, StateSummary> = {}
  const languageCounts: Record<string, number> = {}

  notaryProfiles.forEach((profile) => {
    (profile.languages_spoken as string[]).forEach((language) => {
      languageCounts[language] = (languageCounts[language] || 0) + 1
    })

    const states = (profile.states_licensed.length
      ? profile.states_licensed
      : ["Unknown"]) as string[]

    states.forEach((state) => {
      if (!stateSummaries[state]) {
        stateSummaries[state] = {
          total: 0,
          available: 0,
          busy: 0,
          totalRadius: 0,
          radiusSamples: 0,
          counties: {},
        }
      }
      const summary = stateSummaries[state]
      summary.total += 1
      if (profile.availability_status === NotaryAvailabilityStatus.AVAILABLE) {
        summary.available += 1
      } else {
        summary.busy += 1
      }
      if (profile.service_radius_miles) {
        summary.totalRadius += profile.service_radius_miles
        summary.radiusSamples += 1
      }
      (profile.counties_served as string[]).forEach((county) => {
        summary.counties[county] = (summary.counties[county] || 0) + 1
      })
    })
  })

  const stateRows = Object.entries(stateSummaries)
    .map(([state, stats]) => ({
      state,
      total: stats.total,
      available: stats.available,
      busy: stats.busy,
      avgRadius:
        stats.radiusSamples === 0
          ? 0
          : Math.round(stats.totalRadius / stats.radiusSamples),
      topCounties: Object.entries(stats.counties)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    }))
    .sort((a, b) => b.total - a.total)

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Network Coverage & Availability</h1>
        <p className="text-muted-foreground">
          Track where we have licensed notaries, their availability, and language/service capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Network</CardTitle>
            <CardDescription>All onboarded profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalNotaries)}</div>
            <p className="text-sm text-muted-foreground">
              {availableNotaries} available • {busyNotaries} busy • {unavailableNotaries} unavailable
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>States Covered</CardTitle>
            <CardDescription>Unique states with licensed notaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(stateSummaries).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Top languages:{" "}
              {topLanguages.map(([lang, count]) => `${lang} (${count})`).join(", ")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Radius</CardTitle>
            <CardDescription>Across active notaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(
                Math.round(
                  notaryProfiles.reduce(
                    (sum, profile) => sum + (profile.service_radius_miles || 0),
                    0,
                  ) / (notaryProfiles.length || 1),
                ),
              )}
              mi
            </div>
            <p className="text-sm text-muted-foreground">
              Based on profile radius settings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Languages</CardTitle>
            <CardDescription>Top requested languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {topLanguages.length === 0
                ? "No languages documented"
                : topLanguages.map(([language, count]) => (
                    <div key={language} className="flex justify-between">
                      <span>{language}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>State Coverage Overview</CardTitle>
          <CardDescription>
            Where we have licensed notaries and their current availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stateRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notary profiles found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Busy/Unavailable</TableHead>
                    <TableHead>Avg Radius</TableHead>
                    <TableHead>Top Counties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateRows.map((row) => (
                    <TableRow key={row.state}>
                      <TableCell className="font-medium">{row.state}</TableCell>
                      <TableCell>{row.total}</TableCell>
                      <TableCell>{row.available}</TableCell>
                      <TableCell>{row.busy}</TableCell>
                      <TableCell>{row.avgRadius} mi</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.topCounties.length === 0
                            ? "—"
                            : row.topCounties.map(([county, count]) => (
                                <Badge key={county} variant="outline">
                                  {county} ({count})
                                </Badge>
                              ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notary Roster</CardTitle>
          <CardDescription>Detailed availability and service areas</CardDescription>
        </CardHeader>
        <CardContent>
          {notaryProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notary profiles available.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>States</TableHead>
                    <TableHead>Counties</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Radius</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notaryProfiles.slice(0, 50).map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="font-medium">
                          {profile.User?.name || "Unknown Notary"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {profile.User?.email ?? "No email"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs uppercase tracking-wide">
                          <Badge variant="outline">{profile.availability_status}</Badge>
                          <span className="text-muted-foreground">
                            {profile.onboarding_status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile.states_licensed.slice(0, 3).join(", ") || "—"}
                        {profile.states_licensed.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            +{profile.states_licensed.length - 3} more
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile.counties_served.slice(0, 2).join(", ") || "—"}
                        {profile.counties_served.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            +{profile.counties_served.length - 2} more
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile.languages_spoken.slice(0, 2).join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile.service_radius_miles
                          ? `${profile.service_radius_miles} mi`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

