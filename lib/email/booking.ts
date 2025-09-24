import { bookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'

interface BuildEmailArgs {
  bookingId: string
  customerName: string
  customerEmail: string
  serviceType: string
  serviceName: string
  scheduledDateTime: Date
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  specialInstructions?: string
  locationNotes?: string
  numberOfSigners: number
  numberOfDocuments: number
  paymentStatus: string
  totalAmount: number
  bookingManagementLink: string
  uploadedDocumentNames: string[]
  conversationHistory?: any
  notaryInfo?: any
}

export function buildBookingConfirmationEmail(args: BuildEmailArgs) {
  const client = {
    firstName: args.customerName.split(' ')[0] || '',
    lastName: args.customerName.split(' ').slice(1).join(' ') || '',
    email: args.customerEmail,
  }

  const booking = {
    bookingId: args.bookingId,
    serviceName: args.serviceName,
    serviceType: args.serviceType,
    date: args.scheduledDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: args.scheduledDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    address: args.addressStreet ? `${args.addressStreet}, ${args.addressCity}, ${args.addressState} ${args.addressZip}` : undefined,
    numberOfSigners: args.numberOfSigners,
    numberOfDocuments: args.numberOfDocuments,
    status: 'CONFIRMED',
    paymentStatus: args.paymentStatus,
    totalAmount: args.totalAmount,
    bookingManagementLink: args.bookingManagementLink,
    specialInstructions: args.specialInstructions,
    locationNotes: args.locationNotes,
    witnessRequired: args.serviceType === 'LOAN_SIGNING',
    uploadedDocumentNames: args.uploadedDocumentNames,
  }

  return bookingConfirmationEmail(client, booking, args.conversationHistory, args.notaryInfo)
}


