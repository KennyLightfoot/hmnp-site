// lib/email/templates.ts

interface BookingDetails {
  bookingId?: string;
  serviceName: string;
  date: string; // Format: MMMM D, YYYY (e.g., July 26, 2024)
  time: string; // Format: h:mm A (e.g., 2:00 PM)
  address: string;
  locationNotes?: string;
  numberOfSigners: number | string;
  notaryName?: string; // Tentative for confirmation, confirmed for reminder
  specialInstructions?: string;
  bookingManagementLink?: string; // URL to manage booking
}

interface ClientDetails {
  firstName: string;
  email: string;
}

interface CompanyDetails {
  companyName: string;
  websiteUrl: string;
  phoneNumber?: string;
  logoUrl?: string; // Optional: URL to company logo
}

const defaultCompanyDetails: CompanyDetails = {
  companyName: "Houston Mobile Notary Pros",
  websiteUrl: "https://houstonmobilenotarypros.com", // Default or fetch from env
  phoneNumber: "(832) 617-4285", // Default or fetch from env
};

const emailStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; }
  .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
  .header h1 { color: #002147; margin:0; }
  .content { padding: 20px 0; }
  .content h2 { color: #002147; }
  .content p { margin-bottom: 10px; }
  .details-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
  .details-table th, .details-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
  .details-table th { color: #002147; width: 30%; }
  .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #777; }
  .button { display: inline-block; background-color: #A52A2A; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
  .promise { font-style: italic; color: #002147; margin-top: 15px; }
  a { color: #A52A2A; }
`;

const generateEmailHTML = (title: string, contentHTML: string, company: CompanyDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${company.logoUrl ? `<img src="${company.logoUrl}" alt="${company.companyName} Logo" style="max-width: 150px; margin-bottom: 10px;" /><br/>` : ''}
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${contentHTML}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${company.companyName}. All rights reserved.</p>
          <p><a href="${company.websiteUrl}">${company.websiteUrl}</a></p>
          ${company.phoneNumber ? `<p>Phone: ${company.phoneNumber}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

export const bookingConfirmationEmail = (
  client: ClientDetails,
  booking: BookingDetails,
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `Your Houston Mobile Notary Pros Appointment is Confirmed! ${booking.bookingId ? `(#${booking.bookingId})` : ''}`;
  
  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    <p>Thank you for booking with ${company.companyName}! Your appointment for <strong>${booking.serviceName}</strong> is confirmed.</p>
    <p class="promise">Our Promise: Fast, precise notary service—every time, no hassle.</p>
    
    <h2>Appointment Details:</h2>
    <table class="details-table">
      <tr><th>service:</th><td>${booking.serviceName}</td></tr>
      <tr><th>Date:</th><td>${booking.date}</td></tr>
      <tr><th>Time:</th><td>${booking.time}</td></tr>
      <tr><th>Location:</th><td>${booking.address}</td></tr>
      ${booking.locationNotes ? `<tr><th>Location Notes:</th><td>${booking.locationNotes}</td></tr>` : ''}
      <tr><th>Number of Signers:</th><td>${booking.numberOfSigners}</td></tr>
      ${booking.notaryName ? `<tr><th>Assigned Notary:</th><td>${booking.notaryName} (tentative)</td></tr>` : ''}
      ${booking.specialInstructions ? `<tr><th>Special Instructions:</th><td>${booking.specialInstructions}</td></tr>` : ''}
    </table>

    <h2>What to Expect:</h2>
    <ul>
      <li>Please ensure all signers have a valid, government-issued photo ID.</li>
      <li>Have your documents ready for the notary upon arrival.</li>
      <li>Our notary will arrive promptly at the scheduled time, ready to provide clear and professional service.</li>
    </ul>

    <p>
      If you need to make any changes to your appointment or have any questions, 
      ${booking.bookingManagementLink ? `please visit <a href="${booking.bookingManagementLink}">your booking management page</a> or ` : ''}
      contact us at ${company.phoneNumber ? company.phoneNumber : 'our support line'} or reply to this email.
    </p>
    <p>We look forward to serving you!</p>
    <p>Sincerely,<br/>The Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Booking Confirmation', contentHTML, company),
  };
};

export const appointmentReminderEmail = (
  client: ClientDetails,
  booking: BookingDetails, 
  reminderType: '24hr' | '2hr', // Or more generic like 'upcoming'
  company: CompanyDetails = defaultCompanyDetails
) => {
  const isTomorrow = reminderType === '24hr';
  const subject = `Reminder: Your Notary Appointment with ${company.companyName} is ${isTomorrow ? 'Tomorrow' : 'Soon'}!`;
  
  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    <p>This is a friendly reminder about your upcoming notary appointment with ${company.companyName}.</p>
    
    <h2>Appointment Details:</h2>
    <table class="details-table">
      <tr><th>service:</th><td>${booking.serviceName}</td></tr>
      <tr><th>Date:</th><td>${booking.date} ${isTomorrow ? '(Tomorrow)' : ''}</td></tr>
      <tr><th>Time:</th><td>${booking.time}</td></tr>
      <tr><th>Location:</th><td>${booking.address}</td></tr>
      ${booking.notaryName ? `<tr><th>Assigned Notary:</th><td>${booking.notaryName}</td></tr>` : ''}
    </table>

    <h2>Preparing for Your Appointment:</h2>
    <ul>
      <li>Please have your documents and valid government-issued photo IDs ready for all signers.</li>
      ${booking.notaryName ? `<li>Our notary, ${booking.notaryName}, will arrive at the scheduled time.</li>` : '<li>Our notary will arrive at the scheduled time.</li>'}
    </ul>
    
    <p class="promise">We are committed to providing a smooth and professional experience.</p>
    <p>
      If anything changes or if you have any last-minute questions, please contact us immediately at ${company.phoneNumber ? company.phoneNumber : 'our support line'} or reply to this email.
      ${booking.bookingManagementLink ? ` You can also manage your booking here: <a href="${booking.bookingManagementLink}">${booking.bookingManagementLink}</a>` : ''}
    </p>
    <p>See you soon!</p>
    <p>Best regards,<br/>The Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Appointment Reminder', contentHTML, company),
  };
};

export const postServiceFollowUpEmail = (
  client: ClientDetails,
  booking: Pick<BookingDetails, 'serviceName' | 'date' | 'notaryName'>,
  feedbackLink: string, // Direct link to feedback form or review site
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `Thank You for Choosing ${company.companyName}, ${client.firstName}!`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    <p>We hope your notary appointment for <strong>${booking.serviceName}</strong> on ${booking.date}${booking.notaryName ? ` with ${booking.notaryName}` : ''} met your expectations and was handled with the professionalism and precision we strive for.</p>
    <p class="promise">Our goal is to ensure every client experiences fast, precise notary service—every time, no hassle.</p>
    
    <h2>We Value Your Feedback:</h2>
    <p>Your experience is important to us. If you have a moment, we would greatly appreciate it if you could share your feedback on our service. This helps us continually improve and serve you better.</p>
    <p><a href="${feedbackLink}" class="button">Leave Feedback</a></p>
    
    <p>If you have any further questions or require additional notary services in the future, please don't hesitate to contact us or visit our website at <a href="${company.websiteUrl}">${company.websiteUrl}</a>.</p>
    <p>Thank you again for your trust in ${company.companyName}.</p>
    <p>Sincerely,<br/>The Team at ${company.companyName}</p>
  `;
  
  return {
    subject,
    html: generateEmailHTML('Thank You & Feedback', contentHTML, company),
  };
};

export const paymentFailedEmail = (
  client: ClientDetails,
  booking: Pick<BookingDetails, 'serviceName' | 'date' | 'time' | 'bookingId'>,
  paymentAttemptDetails: {
    failureReason?: string;
    nextStepsLink?: string; // e.g., link to update payment method or contact support
  },
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `Important: Issue with your payment for ${company.companyName} Booking ${booking.bookingId ? `(#${booking.bookingId})` : ''}`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    <p>We encountered an issue processing the payment for your ${company.companyName} booking for <strong>${booking.serviceName}</strong> scheduled on ${booking.date} at ${booking.time}.</p>
    
    ${paymentAttemptDetails.failureReason ? `<p><strong>Reason:</strong> ${paymentAttemptDetails.failureReason}</p>` : ''}
    
    <p>Your booking is currently <strong>not confirmed</strong> due to the payment failure.</p>
    
    <h2>What to do next:</h2>
    <p>
      Please update your payment information or contact us as soon as possible to resolve this issue and secure your appointment.
      ${paymentAttemptDetails.nextStepsLink ? `<a href="${paymentAttemptDetails.nextStepsLink}" class="button">Update Payment / Contact Us</a>` : `Please contact us at ${company.phoneNumber || 'our support line'} or reply to this email.`}
    </p>
    
    <p>If you believe this is an error, or if you have already resolved this, please let us know.</p>
    <p>We apologize for any inconvenience.</p>
    <p>Sincerely,<br/>The Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Payment Issue', contentHTML, company),
  };
}; 