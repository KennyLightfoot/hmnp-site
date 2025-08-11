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


