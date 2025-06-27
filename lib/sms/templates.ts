// lib/sms/templates.ts

interface BookingDetailsForSms {
  serviceName: string;
  date: string; // Format: MMM D (e.g., Jul 26)
  time: string; // Format: h:mma (e.g., 2:00pm)
  addressShort?: string; // Short version of address or just city/area
  notaryName?: string;
}

interface ClientDetailsForSms {
  firstName?: string; // Optional for brevity
}

const companyShortName = "HMNP"; // Houston Mobile Notary Pros

export const bookingConfirmationSms = (
  client: ClientDetailsForSms,
  booking: BookingDetailsForSms
): string => {
  return `Hi ${client.firstName || 'there'}, your ${companyShortName} booking for ${booking.serviceName} on ${booking.date} at ${booking.time} is CONFIRMED. Details via email. Questions? Reply or call.`;
};

export const appointmentReminderSms = (
  client: ClientDetailsForSms,
  booking: BookingDetailsForSms,
  reminderType: '24hr' | '2hr' | '1hr' // Added 1hr option
): string => {
  let reminderLeadText = "tomorrow";
  if (reminderType === '2hr') {
    reminderLeadText = "in approx 2 hours";
  } else if (reminderType === '1hr') {
    reminderLeadText = "in approx 1 hour";
  }
  return `Hi ${client.firstName || 'there'}, reminder: Your ${companyShortName} appt for ${booking.serviceName} is ${reminderLeadText}, ${booking.date} at ${booking.time}${booking.addressShort ? ` at ${booking.addressShort}` : ''}. See you soon! Reply HELP for options/STOP to end.`;
};

export const postServiceFollowUpSms = (
  client: ClientDetailsForSms,
  feedbackLinkShort: string // e.g., a bit.ly link to feedback form
): string => {
  return `Hi ${client.firstName || 'there'}, thanks for choosing ${companyShortName}! We'd love your feedback on your recent notary Service: ${feedbackLinkShort} Reply STOP to end.`;
};

// Example for a cancellation SMS
export const bookingCancelledSms = (
  client: ClientDetailsForSms,
  bookingDate: string, // Format: MMM D
  bookingTime: string  // Format: h:mma
): string => {
  return `Hi ${client.firstName || 'there'}, this confirms your ${companyShortName} appointment for ${bookingDate} at ${bookingTime} has been cancelled. Details via email.`;
};

// Example for payment failed SMS
export const paymentFailedSms = (
  client: ClientDetailsForSms,
  bookingId?: string
): string => {
  return `Hi ${client.firstName || 'there'}, there was an issue processing the payment for your ${companyShortName} booking ${bookingId ? `(#${bookingId})` : ''}. Please check your email or contact us to resolve.`;
};

// No-show check SMS
export const noShowCheckSms = (
  client: ClientDetailsForSms,
  minutesLate: number
): string => {
  return `Hi ${client.firstName || 'there'}, we had you scheduled for a ${companyShortName} appointment ${minutesLate} minutes ago. Are you on your way? Please call us to confirm.`;
};

// Booking ready for service SMS  
export const readyForServiceSms = (
  client: ClientDetailsForSms,
  booking: BookingDetailsForSms
): string => {
  return `Hi ${client.firstName || 'there'}, your ${companyShortName} appointment for ${booking.serviceName} is today! Our notary will contact you shortly before your ${booking.time} appointment.`;
};

// Booking cancelled SMS
export const bookingCancelledByStaffSms = (
  client: ClientDetailsForSms,
  bookingDate: string,
  bookingTime: string
): string => {
  return `Hi ${client.firstName || 'there'}, unfortunately we need to cancel your ${companyShortName} appointment for ${bookingDate} at ${bookingTime}. Our team will contact you to reschedule. We apologize for the inconvenience.`;
}; 