/**
 * Enhanced Booking Confirmation Email Templates
 * Houston Mobile Notary Pros - Comprehensive Meeting Information
 */

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface BookingDetails {
  bookingId: string;
  serviceName: string;
  serviceType: string;
  date: string;
  time: string;
  address?: string;
  numberOfSigners: number;
  numberOfDocuments: number;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  bookingManagementLink: string;
  specialInstructions?: string;
  locationNotes?: string;
  witnessRequired?: boolean;
  documentsRequired?: string[];
  idRequirements?: string[];
  uploadedDocumentNames?: string[];
}

interface ConversationHistory {
  initialInquiry?: string;
  serviceRequests?: string[];
  specialNeeds?: string[];
  previousInteractions?: Array<{
    date: string;
    type: string;
    summary: string;
  }>;
}

interface NotaryInfo {
  name?: string;
  phone?: string;
  email?: string;
  commission_number?: string;
  estimatedArrival?: string;
}

export function bookingConfirmationEmail(
  client: Client,
  booking: BookingDetails,
  conversationHistory?: ConversationHistory,
  notaryInfo?: NotaryInfo
) {
  const subject = `Booking Confirmed: ${booking.serviceName} - ${booking.date}`;
  
  // Service-specific preparation instructions
  const preparationInstructions = getServicePreparationInstructions(booking.serviceType);
  
  // Document requirements based on service type
  const documentRequirements = getDocumentRequirements(booking.serviceType);
  
  // ID requirements
  const idRequirements = getIdRequirements(booking.serviceType);

  // Special section for RON services
  const ronInstructions = booking.serviceType === 'RON_SERVICES' ? `
    <div class="important-info">
      <h3>❗ Important RON (Remote Online Notarization) Instructions</h3>
      <p>Your session will be conducted on the secure Proof.com platform.</p>
      <p><strong>You will receive a separate email invitation directly from Proof.com with a unique link to join your session.</strong> Please check your spam/junk folder if you don't see it within 15 minutes of this confirmation.</p>
      <p>This link is required to meet your notary and complete the notarization.</p>
    </div>
  ` : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .booking-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .important-info { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .preparation-section { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .conversation-history { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
    .checklist { margin: 10px 0; }
    .checklist li { margin: 5px 0; }
    .status-badge { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .price-breakdown { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin: 15px 0; }
    .price-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #e5e7eb; }
    .price-total { background: #f3f4f6; font-weight: bold; }
    .timeline { margin: 15px 0; }
    .timeline-item { border-left: 3px solid #3b82f6; padding-left: 15px; margin: 10px 0; }
    @media (max-width: 600px) {
      .container { margin: 0; }
      .content { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Your notary appointment is all set</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi ${client.firstName || 'Valued Customer'},</p>
      
      <p>Great news! Your booking has been confirmed and we're excited to help you with your notarization needs.</p>

      <!-- RON Instructions -->
      ${ronInstructions}

      <!-- Booking Details -->
      <div class="booking-details">
        <h3>📋 Appointment Details</h3>
        <p><strong>Service:</strong> ${booking.serviceName}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        ${booking.address ? `<p><strong>Location:</strong> ${booking.address}</p>` : ''}
        ${booking.locationNotes ? `<p><strong>Location Notes:</strong> ${booking.locationNotes}</p>` : ''}
        <p><strong>Number of Signers:</strong> ${booking.numberOfSigners}</p>
        <p><strong>Number of Documents:</strong> ${booking.numberOfDocuments}</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>Status:</strong> <span class="status-badge">${booking.status}</span></p>
        ${booking.uploadedDocumentNames?.length ? `
        <div style="margin-top:10px;">
          <p><strong>Uploaded Documents:</strong></p>
          <ul>
            ${booking.uploadedDocumentNames.map((n) => `<li>${n}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      <!-- Notary Information -->
      ${notaryInfo ? `
      <div class="booking-details">
        <h3>👤 Your Notary</h3>
        <p><strong>Name:</strong> ${notaryInfo.name || 'Will be assigned 24 hours before appointment'}</p>
        ${notaryInfo.phone ? `<p><strong>Phone:</strong> ${notaryInfo.phone}</p>` : ''}
        ${notaryInfo.email ? `<p><strong>Email:</strong> ${notaryInfo.email}</p>` : ''}
        ${notaryInfo.commission_number ? `<p><strong>Commission #:</strong> ${notaryInfo.commission_number}</p>` : ''}
        ${notaryInfo.estimatedArrival ? `<p><strong>Estimated Arrival:</strong> ${notaryInfo.estimatedArrival}</p>` : ''}
      </div>
      ` : ''}

      <!-- Conversation History -->
      ${conversationHistory ? `
      <div class="conversation-history">
        <h3>💬 Service Context</h3>
        ${conversationHistory.initialInquiry ? `<p><strong>Your Initial Request:</strong> "${conversationHistory.initialInquiry}"</p>` : ''}
        ${conversationHistory.serviceRequests?.length ? `
        <p><strong>Service Requirements:</strong></p>
        <ul>
          ${conversationHistory.serviceRequests.map(req => `<li>${req}</li>`).join('')}
        </ul>
        ` : ''}
        ${conversationHistory.specialNeeds?.length ? `
        <p><strong>Special Accommodations:</strong></p>
        <ul>
          ${conversationHistory.specialNeeds.map(need => `<li>${need}</li>`).join('')}
        </ul>
        ` : ''}
        ${conversationHistory.previousInteractions?.length ? `
        <p><strong>Previous Interactions:</strong></p>
        <div class="timeline">
          ${conversationHistory.previousInteractions.map(interaction => `
            <div class="timeline-item">
              <strong>${interaction.date}</strong> - ${interaction.type}: ${interaction.summary}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Preparation Instructions -->
      <div class="preparation-section">
        <h3>📝 Please Prepare for Your Appointment</h3>
        
        <h4>✅ Required Documentation</h4>
        <ul class="checklist">
          ${documentRequirements.map(req => `<li>☐ ${req}</li>`).join('')}
        </ul>

        <h4>🆔 Acceptable Forms of ID</h4>
        <ul class="checklist">
          ${idRequirements.map(req => `<li>☐ ${req}</li>`).join('')}
        </ul>

        <h4>🎯 Service-Specific Instructions</h4>
        <ul class="checklist">
          ${preparationInstructions.map(instruction => `<li>☐ ${instruction}</li>`).join('')}
        </ul>

        ${booking.specialInstructions ? `
        <h4>⚠️ Special Instructions</h4>
        <div class="important-info">
          <strong>Important:</strong> ${booking.specialInstructions}
        </div>
        ` : ''}
      </div>

      <!-- Pricing Breakdown -->
      <div class="price-breakdown">
        <div class="price-row">
          <span>Service Fee</span>
          <span>$${booking.totalAmount}</span>
        </div>
        <div class="price-row price-total">
          <span>Total Amount</span>
          <span>$${booking.totalAmount}</span>
        </div>
        <div class="price-row">
          <span>Payment Status</span>
          <span class="status-badge">${booking.paymentStatus}</span>
        </div>
      </div>

      <!-- Important Information -->
      <div class="important-info">
        <h4>⚠️ Important Reminders</h4>
        <ul>
          <li><strong>Arrive 5 minutes early</strong> to allow time for setup</li>
          <li><strong>All signers must be present</strong> with valid ID</li>
          <li><strong>Documents must be complete</strong> before notarization</li>
          <li><strong>No changes allowed</strong> to documents during notarization</li>
          ${booking.witnessRequired ? '<li><strong>Witness required</strong> - Please have your witness present</li>' : ''}
        </ul>
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${booking.bookingManagementLink}" class="button">📋 Manage Booking</a>
        <a href="tel:${process.env.BUSINESS_PHONE ? `+1${String(process.env.BUSINESS_PHONE).replace(/\D/g,'')}` : '+18326174285'}" class="button">📞 Call Us</a>
      </div>

      <!-- What Happens Next -->
      <div class="timeline">
        <h3>🗓️ What Happens Next</h3>
        <div class="timeline-item">
          <strong>24 hours before:</strong> We'll send appointment reminders and notary contact info
        </div>
        <div class="timeline-item">
          <strong>Day of service:</strong> Your notary will arrive at the scheduled time
        </div>
        <div class="timeline-item">
          <strong>After completion:</strong> You'll receive copies of all notarized documents
        </div>
      </div>

      <!-- Review Request Section -->
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <h3 style="color: #1e40af; margin-top: 0;">⭐ Love Your Experience?</h3>
        <p style="font-size: 16px; color: #1e3a8a; margin-bottom: 20px;">
          Your feedback helps us serve you better and helps others find our services. Please take a moment to leave us a review!
        </p>
        <div style="margin: 20px 0;">
          <a href="https://g.page/r/CRcIYPLKzG_5EBM/review" 
             style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px; font-weight: bold;">
            ⭐ Review on Google
          </a>
          <a href="https://www.yelp.com/biz/houston-mobile-notary-pros-houston#reviews" 
             style="background: #d32323; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px; font-weight: bold;">
            ⭐ Review on Yelp
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 15px; margin-bottom: 0;">
          Reviews help us improve and help others find trusted notary services in Houston.
        </p>
      </div>

      <!-- Contact Information -->
      <div style="margin-top: 30px;">
        <h3>📞 Need Help?</h3>
        <p>Our team is here to help! Contact us anytime:</p>
        <ul>
          <li>📧 Email: <a href="mailto:support@houstonmobilenotarypros.com">support@houstonmobilenotarypros.com</a></li>
          <li>📱 Phone: <a href="tel:${process.env.BUSINESS_PHONE ? `+1${String(process.env.BUSINESS_PHONE).replace(/\D/g,'')}` : '+18326174285'}">${process.env.BUSINESS_PHONE || '(832) 617-4285'}</a></li>
          <li>💬 Text: <a href="sms:+18326174285">(832) 617-4285</a></li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Houston Mobile Notary Pros</p>
      <p>Professional • Reliable • Convenient</p>
      <p>
        <a href="https://houstonmobilenotarypros.com">Website</a> |
        <a href="https://houstonmobilenotarypros.com/contact">Contact</a> |
        <a href="https://houstonmobilenotarypros.com/faq">FAQ</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Service-specific preparation instructions
function getServicePreparationInstructions(serviceType: string): string[] {
  const instructions = {
    'QUICK_STAMP_LOCAL': [
      'Document should be printed and ready for signing',
      'Ensure all information is accurate before arrival',
      'Have a flat surface available for signing'
    ],
    'STANDARD_NOTARY': [
      'Review all documents before our arrival',
      'Ensure all signers will be present',
      'Have a quiet, well-lit space ready',
      'Prepare any questions you may have'
    ],
    'EXTENDED_HOURS': [
      'Confirm appointment time via text/call',
      'Ensure location is accessible after hours',
      'Have exterior lighting if evening appointment',
      'Consider neighbors for evening appointments'
    ],
    'LOAN_SIGNING': [
      'Review loan documents in advance if possible',
      'Ensure all borrowers will be present',
      'Have wire transfer information ready',
      'Prepare questions about loan terms',
      'Allow 90-120 minutes for full signing',
      'Clear large table space for documents'
    ],
    'RON_SERVICES': [
      'Test your camera and microphone',
      'Ensure stable internet connection',
      'Have good lighting for ID verification',
      'Download any required software',
      'Be in a quiet, private space',
      'Have documents ready for upload'
    ],
    'BUSINESS_ESSENTIALS': [
      'Prepare all business documents',
      'Have corporate seal if applicable',
      'Ensure authorized signers are present',
      'Review corporate resolutions'
    ],
    'BUSINESS_GROWTH': [
      'Prepare comprehensive document package',
      'Have all corporate documentation ready',
      'Ensure board resolutions are current',
      'Prepare for multiple document review'
    ]
  };

  return instructions[serviceType as keyof typeof instructions] || [
    'Review all documents before appointment',
    'Ensure all required parties are present',
    'Have valid identification ready'
  ];
}

// Document requirements by service type
function getDocumentRequirements(serviceType: string): string[] {
  const requirements = {
    'QUICK_STAMP_LOCAL': [
      'Single document ready for notarization',
      'Document must be complete and unsigned'
    ],
    'STANDARD_NOTARY': [
      'Up to 2 documents ready for notarization',
      'Documents must be complete and unsigned',
      'Any supporting documentation'
    ],
    'EXTENDED_HOURS': [
      'All documents printed and ready',
      'Supporting identification documents',
      'Any reference materials needed'
    ],
    'LOAN_SIGNING': [
      'Complete loan package (provided by lender)',
      'Borrower identification documents',
      'Any additional lender requirements',
      'Wire transfer instructions if required'
    ],
    'RON_SERVICES': [
      'Documents uploaded to secure portal',
      'Digital copies of all supporting docs',
      'Any additional electronic requirements'
    ],
    'BUSINESS_ESSENTIALS': [
      'Corporate documents and resolutions',
      'Business licenses and certificates',
      'Authorized signer documentation'
    ],
    'BUSINESS_GROWTH': [
      'Complete business document package',
      'Corporate resolutions and bylaws',
      'Multiple authorized signer documents'
    ]
  };

  return requirements[serviceType as keyof typeof requirements] || [
    'All documents ready for notarization',
    'Supporting identification documents'
  ];
}

// ID requirements
function getIdRequirements(serviceType: string): string[] {
  const baseRequirements = [
    'Valid driver\'s license',
    'State-issued ID card',
    'Passport',
    'Military ID',
    'Concealed handgun license'
  ];

  // RON has additional requirements
  if (serviceType === 'RON_SERVICES') {
    return [
      ...baseRequirements,
      'ID must be readable on camera',
      'RFID-enabled documents preferred',
      'Backup form of ID recommended'
    ];
  }

  return baseRequirements;
}

export { bookingConfirmationEmail as default }; 