'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface JobOfferActionsProps {
  offerId: string
  bookingId: string
}

export default function JobOfferActions({ offerId, bookingId }: JobOfferActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notary/job-offers/${offerId}/accept`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept offer')
      }

      toast({
        title: 'Offer Accepted',
        description: 'You have successfully accepted this job offer.',
      })

      router.refresh()
      setAcceptDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept offer',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/notary/job-offers/${offerId}/decline`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to decline offer')
      }

      toast({
        title: 'Offer Declined',
        description: 'You have declined this job offer.',
      })

      router.refresh()
      setDeclineDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline offer',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setAcceptDialogOpen(true)}
          disabled={isLoading}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept Offer
        </Button>
        <Button
          variant="outline"
          onClick={() => setDeclineDialogOpen(true)}
          disabled={isLoading}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>

      <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Job Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this job offer? Once accepted, you will be assigned to this booking
              and other notaries will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Offer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Job Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this job offer? You won't be able to accept it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline Offer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

