import { NotificationService } from '@/lib/notifications'

export async function sendBookingConfirmationEmail(args: {
  bookingId: string
  toEmail: string
  subject: string
  html: string
}) {
  await NotificationService.sendNotification({
    bookingId: args.bookingId,
    type: 'BOOKING_CONFIRMATION' as any,
    recipient: { email: args.toEmail },
    content: { subject: args.subject, message: args.html },
    methods: ['EMAIL' as any],
  })
}

export async function sendBookingUpdateEmail(args: {
  bookingId: string
  toEmail: string
  serviceName?: string | null
  message: string
}) {
  await NotificationService.sendNotification({
    bookingId: args.bookingId,
    type: 'BOOKING_RESCHEDULED' as any,
    recipient: { email: args.toEmail },
    content: { subject: `Booking Updated - ${args.serviceName || 'Your appointment'}`, message: args.message },
    methods: ['EMAIL' as any],
  })
}


