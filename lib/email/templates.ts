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
  status?: string; // Current booking status
  paymentStatus?: string; // Payment status
  totalAmount?: number; // Total amount
  depositAmount?: number; // Deposit amount if applicable
}

interface ClientDetails {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
}

interface CompanyDetails {
  companyName: string;
  phoneNumber?: string;
  websiteUrl: string;
  address?: string;
  logoUrl?: string;
}

const defaultCompanyDetails: CompanyDetails = {
  companyName: 'Houston Mobile Notary Pros',
  phoneNumber: '(832) 617-4285',
  websiteUrl: 'https://houstonmobilenotarypros.com',
  address: 'Houston, TX',
  logoUrl: 'https://houstonmobilenotarypros.com/logo.png'
};

function generateEmailHTML(title: string, contentHTML: string, company: CompanyDetails): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .details-table th { background-color: #f9fafb; font-weight: 600; color: #374151; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button:hover { background-color: #2563eb; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-confirmed { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-completed { background-color: #dbeafe; color: #1e40af; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .promise { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .urgent { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .success { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        @media (max-width: 600px) { .container { padding: 10px; } .content { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${company.companyName}</h1>
          <p>Professional Mobile Notary Services</p>
        </div>
        <div class="content">
          ${contentHTML}
        </div>
        <div class="footer">
          <p>© 2024 ${company.companyName}. All rights reserved.</p>
          <p>${company.address} | ${company.phoneNumber} | <a href="${company.websiteUrl}">${company.websiteUrl}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const bookingConfirmationEmail = (
  client: ClientDetails,
  booking: BookingDetails,
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `✅ Your Houston Mobile Notary Pros Appointment is Confirmed! ${booking.bookingId ? `(#${booking.bookingId})` : ''}`;
  
  const statusBadge = booking.status === 'CONFIRMED' ? 
    '<span class="status-badge status-confirmed">CONFIRMED</span>' : 
    '<span class="status-badge status-pending">PENDING</span>';
  
  const paymentInfo = booking.totalAmount ? `
    <tr><th>Total Amount:</th><td>$${booking.totalAmount.toFixed(2)}</td></tr>
    ${booking.depositAmount ? `<tr><th>Deposit Paid:</th><td>$${booking.depositAmount.toFixed(2)}</td></tr>` : ''}
    <tr><th>Payment Status:</th><td>${booking.paymentStatus || 'Pending'}</td></tr>
  ` : '';
  
  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="success">
      <h2>🎉 Your appointment is confirmed!</h2>
      <p>Thank you for choosing ${company.companyName}! Your booking has been successfully confirmed and we're excited to serve you.</p>
    </div>
    
    <div class="promise">
      <strong>Our Promise:</strong> Fast, precise notary service—every time, no hassle.
    </div>
    
    <h2>📋 Appointment Details:</h2>
    <table class="details-table">
      <tr><th>Booking ID:</th><td>${booking.bookingId || 'N/A'} ${statusBadge}</td></tr>
      <tr><th>Service:</th><td>${booking.serviceName}</td></tr>
      <tr><th>Date:</th><td>${booking.date}</td></tr>
      <tr><th>Time:</th><td>${booking.time}</td></tr>
      <tr><th>Location:</th><td>${booking.address}</td></tr>
      ${booking.locationNotes ? `<tr><th>Location Notes:</th><td>${booking.locationNotes}</td></tr>` : ''}
      <tr><th>Number of Signers:</th><td>${booking.numberOfSigners}</td></tr>
      ${booking.notaryName ? `<tr><th>Assigned Notary:</th><td>${booking.notaryName}</td></tr>` : ''}
      ${paymentInfo}
      ${booking.specialInstructions ? `<tr><th>Special Instructions:</th><td>${booking.specialInstructions}</td></tr>` : ''}
    </table>

    <h2>📱 Real-Time Updates:</h2>
    <p>You'll receive real-time updates about your appointment:</p>
    <ul>
      <li><strong>24 hours before:</strong> Final reminder with preparation checklist</li>
      <li><strong>2 hours before:</strong> Notary on the way notification</li>
      <li><strong>During service:</strong> Live status updates</li>
      <li><strong>After completion:</strong> Service summary and feedback request</li>
    </ul>

    <h2>✅ What to Prepare:</h2>
    <ul>
      <li><strong>Valid ID:</strong> Government-issued photo ID for all signers</li>
      <li><strong>Documents:</strong> Have all documents ready and organized</li>
      <li><strong>Questions:</strong> Write down any questions you have</li>
      <li><strong>Payment:</strong> ${booking.paymentStatus === 'PAID' ? 'Payment completed' : 'Have payment method ready'}</li>
    </ul>

    <h2>🔧 Manage Your Booking:</h2>
    <p>
      ${booking.bookingManagementLink ? 
        `<a href="${booking.bookingManagementLink}" class="button">📋 View Booking Details</a>` : 
        'Contact us to make changes to your appointment.'
      }
      <a href="tel:${company.phoneNumber}" class="button">📞 Call Us</a>
    </p>
    
    <div class="promise">
      <strong>Need to make changes?</strong> Contact us immediately at ${company.phoneNumber} or reply to this email.
    </div>
    
    <p>We look forward to providing you with exceptional notary service!</p>
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
  reminderType: '24hr' | '2hr' | '1hr', // Enhanced with 1hr option
  company: CompanyDetails = defaultCompanyDetails
) => {
  const timeDescriptions = {
    '24hr': { title: 'Tomorrow', urgency: 'normal', icon: '📅' },
    '2hr': { title: 'In 2 Hours', urgency: 'high', icon: '⏰' },
    '1hr': { title: 'In 1 Hour', urgency: 'urgent', icon: '🚨' }
  };
  
  const { title, urgency, icon } = timeDescriptions[reminderType];
  const subject = `${icon} Reminder: Your Notary Appointment is ${title}!`;
  
  const urgencyClass = urgency === 'urgent' ? 'urgent' : urgency === 'high' ? 'promise' : '';
  
  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="${urgencyClass}">
      <h2>${icon} Your appointment is ${title}!</h2>
      <p>This is your ${reminderType === '24hr' ? '24-hour' : reminderType === '2hr' ? '2-hour' : '1-hour'} reminder for your notary appointment with ${company.companyName}.</p>
    </div>
    
    <h2>📋 Appointment Details:</h2>
    <table class="details-table">
      <tr><th>Service:</th><td>${booking.serviceName}</td></tr>
      <tr><th>Date:</th><td>${booking.date} ${reminderType === '24hr' ? '(Tomorrow)' : ''}</td></tr>
      <tr><th>Time:</th><td>${booking.time}</td></tr>
      <tr><th>Location:</th><td>${booking.address}</td></tr>
      ${booking.notaryName ? `<tr><th>Your Notary:</th><td>${booking.notaryName}</td></tr>` : ''}
      <tr><th>Contact:</th><td>${company.phoneNumber}</td></tr>
    </table>

    <h2>✅ Final Preparation Checklist:</h2>
    <ul>
      <li><strong>📄 Documents:</strong> All documents ready and organized</li>
      <li><strong>🆔 IDs:</strong> Valid government-issued photo ID for all signers</li>
      <li><strong>💰 Payment:</strong> ${booking.paymentStatus === 'PAID' ? 'Payment completed' : 'Payment method ready'}</li>
      <li><strong>📱 Phone:</strong> Keep your phone nearby for updates</li>
      ${reminderType === '1hr' ? '<li><strong>📍 Location:</strong> Be at the service location</li>' : ''}
    </ul>
    
    ${reminderType === '1hr' ? `
    <div class="urgent">
      <h3>🚨 URGENT - Your notary is on the way!</h3>
      <p>Please ensure you're at the service location and have everything ready. Our notary will arrive shortly.</p>
    </div>
    ` : ''}
    
    <div class="promise">
      <strong>Need to reschedule?</strong> Contact us immediately at ${company.phoneNumber} or reply to this email.
      ${booking.bookingManagementLink ? ` You can also manage your booking here: <a href="${booking.bookingManagementLink}">${booking.bookingManagementLink}</a>` : ''}
    </div>
    
    <p>See you soon!</p>
    <p>Best regards,<br/>The Team at ${company.companyName}</p>
  `;
  
  return {
    subject,
    html: generateEmailHTML('Appointment Reminder', contentHTML, company),
  };
};

export const realTimeStatusUpdateEmail = (
  client: ClientDetails,
  booking: BookingDetails,
  status: 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'delayed',
  company: CompanyDetails = defaultCompanyDetails
) => {
  const statusConfig = {
    on_way: { 
      subject: '🚗 Your Notary is On the Way!', 
      icon: '🚗',
      message: 'Your notary is en route to your location.',
      action: 'Please ensure you\'re ready at the service location.'
    },
    arrived: { 
      subject: '✅ Your Notary Has Arrived!', 
      icon: '✅',
      message: 'Your notary has arrived at your location.',
      action: 'Please meet your notary at the entrance.'
    },
    in_progress: { 
      subject: '📝 Notarization in Progress', 
      icon: '📝',
      message: 'Your notarization service is currently in progress.',
      action: 'Please follow your notary\'s instructions.'
    },
    completed: { 
      subject: '🎉 Service Completed Successfully!', 
      icon: '🎉',
      message: 'Your notarization service has been completed successfully.',
      action: 'You\'ll receive a summary and feedback request shortly.'
    },
    delayed: { 
      subject: '⏰ Service Update - Slight Delay', 
      icon: '⏰',
      message: 'There\'s a slight delay with your appointment.',
      action: 'We\'ll keep you updated on the new arrival time.'
    }
  };
  
  const config = statusConfig[status];
  
  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="${status === 'delayed' ? 'urgent' : 'success'}">
      <h2>${config.icon} ${config.message}</h2>
      <p><strong>Action Required:</strong> ${config.action}</p>
    </div>
    
    <h2>📋 Service Details:</h2>
    <table class="details-table">
      <tr><th>Service:</th><td>${booking.serviceName}</td></tr>
      <tr><th>Date:</th><td>${booking.date}</td></tr>
      <tr><th>Time:</th><td>${booking.time}</td></tr>
      <tr><th>Location:</th><td>${booking.address}</td></tr>
      ${booking.notaryName ? `<tr><th>Notary:</th><td>${booking.notaryName}</td></tr>` : ''}
      <tr><th>Status:</th><td><span class="status-badge status-${status === 'completed' ? 'completed' : 'confirmed'}">${status.toUpperCase()}</span></td></tr>
    </table>
    
    ${status === 'completed' ? `
    <h2>📊 Service Summary:</h2>
    <ul>
      <li>✅ All documents notarized successfully</li>
      <li>✅ All signers verified with valid ID</li>
      <li>✅ Payment processed</li>
      <li>✅ Service completed on time</li>
    </ul>
    
    <div class="promise">
      <h3>We Value Your Feedback!</h3>
      <p>Your experience is important to us. You'll receive a feedback request shortly to help us improve our services.</p>
    </div>
    ` : ''}
    
    <p>If you have any questions, please contact us at ${company.phoneNumber}.</p>
    <p>Best regards,<br/>The Team at ${company.companyName}</p>
  `;
  
  return {
    subject: config.subject,
    html: generateEmailHTML('Status Update', contentHTML, company),
  };
};

export const postServiceFollowUpEmail = (
  client: ClientDetails,
  booking: Pick<BookingDetails, 'serviceName' | 'date' | 'notaryName'>,
  feedbackLink: string, // Direct link to feedback form or review site
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `🎉 Thank You for Choosing ${company.companyName}, ${client.firstName}!`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="success">
      <h2>🎉 Service Completed Successfully!</h2>
      <p>Thank you for choosing ${company.companyName}! Your notary appointment for <strong>${booking.serviceName}</strong> on ${booking.date}${booking.notaryName ? ` with ${booking.notaryName}` : ''} has been completed successfully.</p>
    </div>
    
    <div class="promise">
      <strong>Our Promise Delivered:</strong> Fast, precise notary service—every time, no hassle.
    </div>
    
    <h2>📊 Service Summary:</h2>
    <ul>
      <li>✅ All documents notarized according to state requirements</li>
      <li>✅ All signers verified with valid government-issued ID</li>
      <li>✅ Professional service completed on time</li>
      <li>✅ Payment processed successfully</li>
    </ul>
    
    <h2>⭐ We Value Your Feedback:</h2>
    <p>Your experience is important to us. If you have a moment, we would greatly appreciate it if you could share your feedback on our service. This helps us continually improve and serve you better.</p>
    <p><a href="${feedbackLink}" class="button">📝 Leave Feedback</a></p>
    
    <h2>📞 Need Additional Services?</h2>
    <p>If you require additional notary services in the future, please don't hesitate to contact us:</p>
    <ul>
      <li>📞 Phone: ${company.phoneNumber}</li>
      <li>🌐 Website: <a href="${company.websiteUrl}">${company.websiteUrl}</a></li>
      <li>📧 Email: Reply to this message</li>
    </ul>
    
    <div class="promise">
      <h3>Referral Rewards Program</h3>
      <p>Did you know? You can earn rewards by referring friends and family to our services. Contact us for details!</p>
    </div>
    
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
    retryOptions?: string[];
  },
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `⚠️ Important: Payment Issue with your ${company.companyName} Booking ${booking.bookingId ? `(#${booking.bookingId})` : ''}`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="urgent">
      <h2>⚠️ Payment Processing Issue</h2>
      <p>We encountered an issue processing the payment for your ${company.companyName} booking for <strong>${booking.serviceName}</strong> scheduled on ${booking.date} at ${booking.time}.</p>
    </div>
    
    ${paymentAttemptDetails.failureReason ? `
    <h2>🔍 Issue Details:</h2>
    <p><strong>Reason:</strong> ${paymentAttemptDetails.failureReason}</p>
    ` : ''}
    
    <div class="urgent">
      <h3>⚠️ Important:</h3>
      <p>Your booking is currently <strong>not confirmed</strong> due to the payment failure. To secure your appointment, please resolve this issue as soon as possible.</p>
    </div>
    
    <h2>🛠️ How to Resolve:</h2>
    <ul>
      <li><strong>Update Payment Method:</strong> Use a different card or payment method</li>
      <li><strong>Check Card Details:</strong> Verify your card information is correct</li>
      <li><strong>Contact Your Bank:</strong> Ensure your card allows online transactions</li>
      <li><strong>Call Us:</strong> We can help you complete payment over the phone</li>
    </ul>
    
    ${paymentAttemptDetails.retryOptions && paymentAttemptDetails.retryOptions.length > 0 ? `
    <h2>💳 Alternative Payment Options:</h2>
    <ul>
      ${paymentAttemptDetails.retryOptions.map(option => `<li>${option}</li>`).join('')}
    </ul>
    ` : ''}
    
    <h2>📞 Need Help?</h2>
    <p>
      ${paymentAttemptDetails.nextStepsLink ? 
        `<a href="${paymentAttemptDetails.nextStepsLink}" class="button">🔄 Update Payment / Contact Us</a>` : 
        `Please contact us immediately at ${company.phoneNumber} or reply to this email.`
      }
    </p>
    
    <div class="promise">
      <h3>We're Here to Help!</h3>
      <p>Don't worry - we'll work with you to resolve this quickly and ensure your appointment is secured. Our team is available to assist you with any payment issues.</p>
    </div>
    
    <p>If you believe this is an error, or if you have already resolved this, please let us know.</p>
    <p>We apologize for any inconvenience.</p>
    <p>Sincerely,<br/>The Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Payment Issue', contentHTML, company),
  };
};

export const bookingCancellationEmail = (
  client: ClientDetails,
  booking: Pick<BookingDetails, 'serviceName' | 'date' | 'time' | 'bookingId'>,
  cancellationDetails: {
    reason?: string;
    refundAmount?: number;
    refundStatus?: string;
    rescheduleLink?: string;
  },
  company: CompanyDetails = defaultCompanyDetails
) => {
  const subject = `❌ Booking Cancelled - ${company.companyName} ${booking.bookingId ? `(#${booking.bookingId})` : ''}`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="urgent">
      <h2>❌ Booking Cancellation Confirmed</h2>
      <p>Your booking for <strong>${booking.serviceName}</strong> scheduled on ${booking.date} at ${booking.time} has been cancelled.</p>
    </div>
    
    ${cancellationDetails.reason ? `
    <h2>📋 Cancellation Details:</h2>
    <p><strong>Reason:</strong> ${cancellationDetails.reason}</p>
    ` : ''}
    
    ${cancellationDetails.refundAmount ? `
    <h2>💰 Refund Information:</h2>
    <ul>
      <li><strong>Refund Amount:</strong> $${cancellationDetails.refundAmount.toFixed(2)}</li>
      <li><strong>Refund Status:</strong> ${cancellationDetails.refundStatus || 'Processing'}</li>
      <li><strong>Processing Time:</strong> 3-5 business days</li>
    </ul>
    ` : ''}
    
    <h2>🔄 Reschedule Your Appointment:</h2>
    <p>We'd be happy to help you reschedule your appointment for a more convenient time.</p>
    <p>
      ${cancellationDetails.rescheduleLink ? 
        `<a href="${cancellationDetails.rescheduleLink}" class="button">📅 Reschedule Now</a>` : 
        `Contact us at ${company.phoneNumber} to reschedule.`
      }
    </p>
    
    <div class="promise">
      <h3>We're Here to Help!</h3>
      <p>If you have any questions about the cancellation or would like to reschedule, please don't hesitate to contact us. We're committed to providing you with excellent service.</p>
    </div>
    
    <p>Thank you for considering ${company.companyName} for your notary needs.</p>
    <p>Sincerely,<br/>The Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Booking Cancellation', contentHTML, company),
  };
};

export const supportRequestEmail = (
  client: ClientDetails,
  supportDetails: {
    issueType: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    bookingId?: string;
  },
  company: CompanyDetails = defaultCompanyDetails
) => {
  const priorityConfig = {
    low: { color: 'status-confirmed', icon: '📋' },
    medium: { color: 'status-pending', icon: '⚠️' },
    high: { color: 'status-pending', icon: '🚨' },
    urgent: { color: 'status-confirmed', icon: '🚨' }
  };
  
  const config = priorityConfig[supportDetails.priority];
  
  const subject = `${config.icon} Support Request - ${supportDetails.issueType} ${supportDetails.bookingId ? `(Booking #${supportDetails.bookingId})` : ''}`;

  const contentHTML = `
    <p>Dear ${client.firstName},</p>
    
    <div class="success">
      <h2>📞 Support Request Received</h2>
      <p>Thank you for contacting ${company.companyName} support. We've received your request and will respond as quickly as possible.</p>
    </div>
    
    <h2>📋 Request Details:</h2>
    <table class="details-table">
      <tr><th>Issue Type:</th><td>${supportDetails.issueType}</td></tr>
      <tr><th>Priority:</th><td><span class="status-badge ${config.color}">${supportDetails.priority.toUpperCase()}</span></td></tr>
      ${supportDetails.bookingId ? `<tr><th>Booking ID:</th><td>${supportDetails.bookingId}</td></tr>` : ''}
      <tr><th>Submitted:</th><td>${new Date().toLocaleString()}</td></tr>
    </table>
    
    <h2>📝 Description:</h2>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
      ${supportDetails.description}
    </div>
    
    <h2>⏱️ Response Time:</h2>
    <ul>
      <li><strong>Urgent:</strong> Within 1 hour</li>
      <li><strong>High:</strong> Within 4 hours</li>
      <li><strong>Medium:</strong> Within 24 hours</li>
      <li><strong>Low:</strong> Within 48 hours</li>
    </ul>
    
    <div class="promise">
      <h3>Need Immediate Assistance?</h3>
      <p>If this is an urgent matter, please call us directly at ${company.phoneNumber} for immediate assistance.</p>
    </div>
    
    <p>We appreciate your patience and look forward to resolving your issue quickly.</p>
    <p>Sincerely,<br/>The Support Team at ${company.companyName}</p>
  `;

  return {
    subject,
    html: generateEmailHTML('Support Request', contentHTML, company),
  };
}; 