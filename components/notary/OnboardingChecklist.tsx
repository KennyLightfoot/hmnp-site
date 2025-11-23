'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Upload, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { NotaryOnboardingStatus } from '@/lib/prisma-types'

interface OnboardingItem {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

interface OnboardingChecklistProps {
  profileId: string
  userId: string
  items: OnboardingItem[]
  currentStatus: NotaryOnboardingStatus
}

export default function OnboardingChecklist({
  profileId,
  userId,
  items,
  currentStatus,
}: OnboardingChecklistProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleItemClick = async (itemId: string) => {
    // Navigate to appropriate page or open modal for each item
    switch (itemId) {
      case 'commission':
        router.push('/notary/settings?tab=commission')
        break
      case 'eo_insurance':
        router.push('/notary/settings?tab=insurance')
        break
      case 'background_check':
        router.push('/notary/settings?tab=background')
        break
      case 'w9':
        router.push('/notary/settings?tab=w9')
        break
      case 'profile':
        router.push('/notary/settings?tab=profile')
        break
      default:
        router.push('/notary/settings')
    }
  }

  const handleCompleteOnboarding = async () => {
    const allRequiredCompleted = items.filter((item) => item.required).every((item) => item.completed)

    if (!allRequiredCompleted) {
      toast({
        title: 'Incomplete',
        description: 'Please complete all required items before submitting.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notary/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete onboarding')
      }

      toast({
        title: 'Onboarding Complete',
        description: 'Your profile has been submitted for review.',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete onboarding',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                item.completed ? 'bg-green-50 border-green-200' : ''
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="flex-shrink-0 mt-1">
                {item.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {item.completed && (
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Complete
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="ghost" size="sm">
                  {item.completed ? (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {items.filter((item) => item.required).every((item) => item.completed) &&
          currentStatus !== 'COMPLETE' && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={handleCompleteOnboarding} disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Once submitted, your profile will be reviewed and activated.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  )
}

