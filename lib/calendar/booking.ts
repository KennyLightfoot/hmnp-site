import { getGoogleCalendar } from '@/lib/google-calendar'

interface BuildCalendarPayloadArgs {
  bookingId: string
  serviceName: string
  serviceType: string
  scheduledDateTime: Date
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  locationNotes?: string
  specialInstructions?: string
  numberOfSigners: number
  numberOfDocuments: number
  totalAmount: number
  customerEmail: string
  customerName: string
}

export function buildCalendarBookingPayload(args: BuildCalendarPayloadArgs) {
  return {
    id: args.bookingId,
    Service: {
      name: args.serviceName,
      serviceType: args.serviceType,
      // durationMinutes is determined by downstream using service type when absent
    },
    customerEmail: args.customerEmail,
    customerName: args.customerName,
    scheduledDateTime: args.scheduledDateTime,
    addressStreet: args.addressStreet,
    addressCity: args.addressCity,
    addressState: args.addressState,
    addressZip: args.addressZip,
    locationNotes: args.locationNotes,
    specialInstructions: args.specialInstructions,
    numberOfSigners: args.numberOfSigners,
    numberOfDocuments: args.numberOfDocuments,
    priceAtBooking: args.totalAmount,
    status: 'CONFIRMED',
    notes: args.specialInstructions,
  }
}

export async function createCalendarEventWithContext(
  payload: any,
  conversationHistory: any,
  notaryInfo: any
) {
  const googleCalendar = getGoogleCalendar()
  return googleCalendar.createBookingEvent(payload, conversationHistory, notaryInfo)
}

export async function updateCalendarEventWithContext(
  eventId: string,
  booking: any,
  conversationHistory: any,
  notaryInfo: any
) {
  const googleCalendar = getGoogleCalendar()
  return googleCalendar.updateBookingEvent(eventId, booking, conversationHistory, notaryInfo)
}


