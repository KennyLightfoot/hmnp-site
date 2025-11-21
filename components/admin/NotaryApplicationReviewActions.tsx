'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { NotaryApplicationStatus } from '@prisma/client'

interface NotaryApplicationReviewActionsProps {
  applicationId: string
  currentStatus: NotaryApplicationStatus
}

export default function NotaryApplicationReviewActions({
  applicationId,
  currentStatus,
}: NotaryApplicationReviewActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)

  const handleStatusChange = async (status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW', notes?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/notary-applications/${applicationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: notes || reviewNotes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update application status')
      }

      toast({
        title: 'Status Updated',
        description: `Application status updated to ${status}`,
      })

      router.refresh()
      setApproveDialogOpen(false)
      setRejectDialogOpen(false)
      setReviewNotes('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvertToUser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/notary-applications/${applicationId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to convert application to user')
      }

      const data = await response.json()

      toast({
        title: 'Application Converted',
        description: `User account created. User ID: ${data.userId}`,
      })

      router.push(`/admin/users`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert application',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setConvertDialogOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus === 'PENDING' && (
        <>
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Application</DialogTitle>
                <DialogDescription>
                  Approve this notary application. You can add review notes below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approve-notes">Review Notes (optional)</Label>
                  <Textarea
                    id="approve-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve Application'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Application</DialogTitle>
                <DialogDescription>
                  Reject this notary application. Please provide a reason.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reject-notes">Rejection Reason *</Label>
                  <Textarea
                    id="reject-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={isLoading || !reviewNotes.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Application'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('UNDER_REVIEW')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Mark Under Review'
            )}
          </Button>
        </>
      )}

      {currentStatus === 'APPROVED' && (
        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Convert to User Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert to User Account</DialogTitle>
              <DialogDescription>
                This will create a user account for this notary and send them an invitation email.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConvertToUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

