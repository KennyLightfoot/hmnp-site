import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Role, NotaryOnboardingStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import OnboardingChecklist from '@/components/notary/OnboardingChecklist'

export default async function NotaryOnboardingPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role

  if (!session?.user || userRole !== Role.NOTARY) {
    redirect('/portal')
  }

  const profile = await prisma.notary_profiles.findUnique({
    where: { user_id: session.user.id },
  })

  if (!profile) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Notary profile not found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onboardingItems = [
    {
      id: 'commission',
      title: 'Commission Verification',
      description: 'Upload your notary commission certificate',
      completed: !!profile.commission_number && !!profile.commission_expiry,
      required: true,
    },
    {
      id: 'eo_insurance',
      title: 'E&O Insurance',
      description: 'Upload your Errors & Omissions insurance certificate',
      completed: !!profile.eo_insurance_provider && !!profile.eo_insurance_policy && !!profile.eo_insurance_expiry,
      required: true,
    },
    {
      id: 'background_check',
      title: 'Background Check',
      description: 'Complete background check verification',
      completed: profile.background_check_status === 'APPROVED',
      required: true,
    },
    {
      id: 'w9',
      title: 'W-9 Form',
      description: 'Submit W-9 form for tax purposes',
      completed: profile.w9_on_file === true,
      required: true,
    },
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Fill out your service areas, availability, and preferences',
      completed: !!profile.base_address && profile.states_licensed.length > 0,
      required: true,
    },
  ]

  const completedCount = onboardingItems.filter((item) => item.completed).length
  const totalRequired = onboardingItems.filter((item) => item.required).length
  const progressPercentage = (completedCount / totalRequired) * 100

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-gray-600 mt-1">Complete these steps to start accepting jobs</p>
      </div>

      {/* Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            {completedCount} of {totalRequired} required steps completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-4">
              <Badge
                variant={
                  profile.onboarding_status === 'COMPLETE'
                    ? 'default'
                    : profile.onboarding_status === 'IN_PROGRESS'
                    ? 'secondary'
                    : 'outline'
                }
              >
                Status: {profile.onboarding_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <OnboardingChecklist
        profileId={profile.id}
        userId={session.user.id}
        items={onboardingItems}
        currentStatus={profile.onboarding_status}
      />
    </div>
  )
}

