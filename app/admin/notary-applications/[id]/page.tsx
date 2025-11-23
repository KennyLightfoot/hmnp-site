import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { Role, NotaryApplicationStatus } from "@/lib/prisma-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils/date-utils";
import { ArrowLeft } from "lucide-react";
import NotaryApplicationReviewActions from "@/components/admin/NotaryApplicationReviewActions";
import type { Prisma } from "@/lib/prisma-types";

type NotaryApplicationPageProps = {
  params: Promise<{ id: string }>
}

const applicationInclude = {
  reviewedBy: {
    select: {
      name: true,
      email: true,
    },
  },
  convertedToUser: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.NotaryApplicationInclude

type NotaryApplicationDetail = Prisma.NotaryApplicationGetPayload<{
  include: typeof applicationInclude
}>

export default async function NotaryApplicationDetailPage({
  params,
}: NotaryApplicationPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions);

  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect('/portal');
  }

  const application = await prisma.notaryApplication.findUnique({
    where: { id },
    include: applicationInclude,
  }) as NotaryApplicationDetail | null;

  if (!application) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-500">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Link href="/admin/notary-applications" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {application.firstName} {application.lastName}
          </h1>
          <p className="text-gray-600">{application.email}</p>
        </div>
        <Badge
          variant={
            application.status === NotaryApplicationStatus.APPROVED
              ? 'default'
              : application.status === NotaryApplicationStatus.REJECTED
              ? 'destructive'
              : 'outline'
          }
        >
          {application.status}
        </Badge>
      </div>

      {/* Review Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Review Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <NotaryApplicationReviewActions applicationId={application.id} currentStatus={application.status} />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="mt-1">{application.firstName} {application.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1">{application.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="mt-1">{application.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Applied</label>
              <p className="mt-1">{formatDateTime(application.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notary Commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Commission Number</label>
              <p className="mt-1">{application.commissionNumber || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              <p className="mt-1">{application.commissionState || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Expiry Date</label>
              <p className="mt-1">{application.commissionExpiry ? formatDateTime(application.commissionExpiry) : 'Not provided'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">States Licensed</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {application.statesLicensed.map((state: string) => (
                <Badge key={state} variant="outline">{state}</Badge>
              ))}
            </div>
          </div>
          {application.countiesServed.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Counties Served</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.countiesServed.map((county: string) => (
                  <Badge key={county} variant="secondary">{county}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Service Types</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {application.serviceTypes.map((type: string) => (
                <Badge key={type} variant="default">{type}</Badge>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Years of Experience</label>
              <p className="mt-1">{application.yearsExperience || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Service Radius</label>
              <p className="mt-1">{application.serviceRadiusMiles || 25} miles</p>
            </div>
          </div>
          {application.languagesSpoken.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.languagesSpoken.map((lang: string) => (
                  <Badge key={lang} variant="secondary">{lang}</Badge>
                ))}
              </div>
            </div>
          )}
          {application.specialCertifications.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Special Certifications</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {application.specialCertifications.map((cert: string) => (
                  <Badge key={cert} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E&O Insurance */}
      {(application.eoInsuranceProvider || application.eoInsurancePolicy) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Errors & Omissions Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Provider</label>
                <p className="mt-1">{application.eoInsuranceProvider || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Policy Number</label>
                <p className="mt-1">{application.eoInsurancePolicy || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                <p className="mt-1">{application.eoInsuranceExpiry ? formatDateTime(application.eoInsuranceExpiry) : 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      {(application.baseAddress || application.baseZip) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Base Address</label>
                <p className="mt-1">{application.baseAddress || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Base ZIP</label>
                <p className="mt-1">{application.baseZip || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(application.whyInterested || application.availabilityNotes || application.references || application.resumeUrl) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.whyInterested && (
              <div>
                <label className="text-sm font-medium text-gray-600">Why Interested</label>
                <p className="mt-1 text-gray-700">{application.whyInterested}</p>
              </div>
            )}
            {application.availabilityNotes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Availability Notes</label>
                <p className="mt-1 text-gray-700">{application.availabilityNotes}</p>
              </div>
            )}
            {application.references && (
              <div>
                <label className="text-sm font-medium text-gray-600">References</label>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{application.references}</p>
              </div>
            )}
            {application.resumeUrl && (
              <div>
                <label className="text-sm font-medium text-gray-600">Resume</label>
                <p className="mt-1">
                  <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View Resume
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review History */}
      {application.reviewedBy && (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-600">Reviewed By</label>
                <p className="mt-1">{application.reviewedBy.name || application.reviewedBy.email}</p>
              </div>
              {application.reviewedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reviewed At</label>
                  <p className="mt-1">{formatDateTime(application.reviewedAt)}</p>
                </div>
              )}
              {application.reviewNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Review Notes</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{application.reviewNotes}</p>
                </div>
              )}
              {application.convertedToUser && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Converted To User</label>
                  <p className="mt-1">
                    <Link href={`/admin/users`} className="text-primary hover:underline">
                      {application.convertedToUser.name || application.convertedToUser.email}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

