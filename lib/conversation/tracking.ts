import { ConversationTracker } from '@/lib/conversation-tracker'

export async function trackBookingRequest(params: {
  customerEmail: string
  customerName: string
  serviceType: string
  bookingId: string
  serviceName: string
  scheduledDateTime: Date
  totalAmount: number
  numberOfSigners: number
  numberOfDocuments: number
  metadata?: Record<string, any>
}) {
  await ConversationTracker.trackBookingRequest({
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    serviceType: params.serviceType,
    bookingId: params.bookingId,
    message: `Booking created for ${params.serviceName} on ${params.scheduledDateTime.toLocaleDateString()}`,
    metadata: {
      scheduledDateTime: params.scheduledDateTime.toISOString(),
      totalAmount: params.totalAmount,
      numberOfSigners: params.numberOfSigners,
      numberOfDocuments: params.numberOfDocuments,
      ...params.metadata,
    },
  })
}

export async function getBookingContext(customerEmail: string, bookingId: string) {
  return ConversationTracker.getBookingContext(customerEmail, bookingId)
}

export async function trackUpdateInteraction(params: {
  customerEmail: string
  customerName: string
  bookingId: string
  updateReason: string
  changes: Record<string, any>
}) {
  await ConversationTracker.trackInteraction({
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    interactionType: 'booking_request',
    source: 'system',
    subject: `Booking Updated - ${params.bookingId}`,
    message: `Booking updated: ${params.updateReason}`,
    metadata: {
      bookingId: params.bookingId,
      changes: params.changes,
      updateReason: params.updateReason,
    },
    tags: ['booking_update', 'system'],
  })
}

export async function trackAppointmentCompletion(params: {
  customerEmail: string
  customerName: string
  bookingId: string
  serviceType: string
  completionNotes?: string
  documentsCompleted: string[]
  nextSteps?: string[]
}) {
  await ConversationTracker.trackAppointmentCompletion({
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    bookingId: params.bookingId,
    serviceType: params.serviceType,
    notes: params.completionNotes,
    metadata: {
      documentsCompleted: params.documentsCompleted,
      nextSteps: params.nextSteps,
    },
  })
}


