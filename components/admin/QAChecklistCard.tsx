"use client"

import { useState, useTransition } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type QAStatus = 'PENDING' | 'IN_PROGRESS' | 'FLAGGED' | 'COMPLETE'

const STATUS_LABELS: Record<QAStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  FLAGGED: 'Needs Follow-up',
  COMPLETE: 'Complete',
}

interface ChecklistProps {
  bookingId: string
  initialQa: {
    status: QAStatus
    journalEntryVerified: boolean
    sealPhotoVerified: boolean
    documentCountVerified: boolean
    clientConfirmationVerified: boolean
    closeoutFormVerified: boolean
    notes: string | null
    followUpAction: string | null
    updatedAt?: string
  } | null
}

export function QAChecklistCard({ bookingId, initialQa }: ChecklistProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [status, setStatus] = useState<QAStatus>(initialQa?.status ?? 'PENDING')
  const [journalEntry, setJournalEntry] = useState(initialQa?.journalEntryVerified ?? false)
  const [sealPhoto, setSealPhoto] = useState(initialQa?.sealPhotoVerified ?? false)
  const [documentCount, setDocumentCount] = useState(initialQa?.documentCountVerified ?? false)
  const [clientConfirmation, setClientConfirmation] = useState(initialQa?.clientConfirmationVerified ?? false)
  const [closeoutForm, setCloseoutForm] = useState(initialQa?.closeoutFormVerified ?? false)
  const [notes, setNotes] = useState(initialQa?.notes ?? '')
  const [followUp, setFollowUp] = useState(initialQa?.followUpAction ?? '')

  const lastUpdated = initialQa?.updatedAt ? new Date(initialQa.updatedAt) : null

  const onSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/bookings/${bookingId}/qa`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
            journalEntryVerified: journalEntry,
            sealPhotoVerified: sealPhoto,
            documentCountVerified: documentCount,
            clientConfirmationVerified: clientConfirmation,
            closeoutFormVerified: closeoutForm,
            notes,
            followUpAction: followUp,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update QA checklist')
        }

        toast({
          title: 'QA checklist saved',
          description: 'The review has been updated.',
        })
      } catch (error) {
        toast({
          title: 'Save failed',
          description: (error as Error).message,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QA Checklist</CardTitle>
        <CardDescription>Record the 5-step post-service QA review.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <StatusField value={status} onChange={setStatus} />
          <ChecklistItem
            label="Journal entry captured"
            helper="Signer info, ID reference, and fee recorded"
            checked={journalEntry}
            onChange={setJournalEntry}
          />
          <ChecklistItem
            label="Seal photo uploaded"
            helper="Stamp impression and notarized page linked"
            checked={sealPhoto}
            onChange={setSealPhoto}
          />
          <ChecklistItem
            label="Document count verified"
            helper="All documents accounted for before leaving"
            checked={documentCount}
            onChange={setDocumentCount}
          />
          <ChecklistItem
            label="Client confirmation logged"
            helper="Verbal or written confirmation tracked"
            checked={clientConfirmation}
            onChange={setClientConfirmation}
          />
          <ChecklistItem
            label="Closeout form submitted"
            helper="Closeout workflow submitted in portal"
            checked={closeoutForm}
            onChange={setCloseoutForm}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qa-notes">Notes</Label>
          <Textarea
            id="qa-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Audit notes, exceptions, or context"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qa-follow-up">Follow-up actions</Label>
          <Textarea
            id="qa-follow-up"
            value={followUp}
            onChange={(event) => setFollowUp(event.target.value)}
            placeholder="Remediation tasks or reminders"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleString()}` : 'No QA review yet'}
          </div>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save QA Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistItem({ label, helper, checked, onChange }: { label: string; helper: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={label} checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <div>
        <Label htmlFor={label} className="font-medium text-sm">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

function StatusField({ value, onChange }: { value: QAStatus; onChange: (value: QAStatus) => void }) {
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select value={value} onValueChange={(val) => onChange(val as QAStatus)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
