/**
 * Example: GHL Code with AI - Webhook Handler for Booking Sync
 * 
 * This example shows how to use AI-generated code in GHL workflows
 * to process webhook data and sync with your web app.
 */

// ============================================
// EXAMPLE 1: Booking Creation from GHL Form
// ============================================

// AI Prompt:
// "When a booking form is submitted, extract all form fields including 
// service type, date, time, location, and client details. Validate the 
// data and create a booking in my web app API. Handle errors gracefully."

// Generated Code (to use in GHL Custom Code action):
const formData = inputs.form || {};
const contact = inputs.contact || {};

// Extract and validate form data
const bookingData = {
  // Client Information
  clientName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
  email: contact.email || formData.email,
  phone: contact.phone || formData.phone,
  
  // Service Details
  serviceType: formData.service_type || 'GENERAL_NOTARY',
  scheduledDate: formData.appointment_date,
  scheduledTime: formData.appointment_time,
  location: formData.service_location || formData.address,
  
  // Additional Details
  numberOfSigners: parseInt(formData.number_of_signers) || 1,
  documentsCount: parseInt(formData.documents_count) || 1,
  specialInstructions: formData.special_instructions || '',
  
  // Metadata
  source: 'GHL_FORM',
  ghlContactId: contact.id,
  formId: formData.form_id,
  submittedAt: new Date().toISOString()
};

// Validate required fields
const errors = [];
if (!bookingData.clientName) errors.push('Client name is required');
if (!bookingData.email) errors.push('Email is required');
if (!bookingData.scheduledDate) errors.push('Appointment date is required');
if (!bookingData.scheduledTime) errors.push('Appointment time is required');

// If validation fails, create a task for manual review
if (errors.length > 0) {
  return {
    success: false,
    errors: errors,
    createTask: {
      title: 'Manual Booking Review Required',
      description: `Form submission has validation errors: ${errors.join(', ')}`,
      assignedTo: 'team',
      priority: 'high'
    },
    updateContact: {
      tags: ['Status:Booking_Validation_Failed', 'Action:Manual_Review_Required']
    }
  };
}

// Combine date and time into ISO format
const scheduledDateTime = new Date(`${bookingData.scheduledDate} ${bookingData.scheduledTime}`);
bookingData.scheduledFor = scheduledDateTime.toISOString();

// Call your web app API to create the booking
try {
  const response = await fetch('https://houstonmobilenotarypros.com/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${inputs.custom_values.api_key}`,
      'X-Source': 'GHL-Workflow'
    },
    body: JSON.stringify(bookingData)
  });

  const result = await response.json();

  if (response.ok) {
    // Success - update contact and trigger confirmation
    return {
      success: true,
      bookingId: result.id,
      updateContact: {
        customFields: {
          cf_booking_id: result.id,
          cf_booking_status: 'CONFIRMED',
          cf_next_appointment: scheduledDateTime.toISOString(),
          cf_total_quoted: result.totalPrice.toString()
        },
        tags: ['Status:Booking_Confirmed', 'Customer:Active']
      },
      triggerWorkflow: 'booking_confirmation_sequence',
      sendNotification: true
    };
  } else {
    // API error - handle gracefully
    return {
      success: false,
      error: result.error || 'Booking creation failed',
      createTask: {
        title: 'Booking API Error',
        description: `API returned error: ${result.error || response.statusText}`,
        assignedTo: 'tech_team'
      },
      updateContact: {
        tags: ['Status:Booking_API_Error', 'Action:Technical_Review_Required']
      }
    };
  }
} catch (error) {
  // Network or other error
  return {
    success: false,
    error: error.message,
    createTask: {
      title: 'Booking System Error',
      description: `System error: ${error.message}`,
      assignedTo: 'tech_team',
      priority: 'urgent'
    }
  };
}

// ============================================
// EXAMPLE 2: Payment Status Webhook Handler
// ============================================

// AI Prompt:
// "Process a Stripe webhook for payment success. Update the contact's 
// payment status, remove pending tags, add paid tags, and sync the 
// booking status with my web app."

// Generated Code:
const webhook = inputs.webhook || {};
const paymentIntent = webhook.data?.object || {};
const metadata = paymentIntent.metadata || {};

// Extract booking and contact IDs from metadata
const bookingId = metadata.booking_id;
const ghlContactId = metadata.ghl_contact_id;

if (!bookingId || !ghlContactId) {
  return {
    success: false,
    error: 'Missing booking or contact ID in payment metadata'
  };
}

// Update booking status in your web app
const bookingUpdate = await fetch(`https://houstonmobilenotarypros.com/api/bookings/${bookingId}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${inputs.custom_values.api_key}`
  },
  body: JSON.stringify({
    status: 'PAYMENT_COMPLETED',
    paymentDetails: {
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      paidAt: new Date().toISOString()
    }
  })
});

const bookingResult = await bookingUpdate.json();

// Format payment amount for display
const paymentAmount = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: paymentIntent.currency || 'usd'
}).format(paymentIntent.amount / 100);

// Return instructions for GHL to update the contact
return {
  success: true,
  updateContact: {
    id: ghlContactId,
    customFields: {
      cf_payment_status: 'Paid',
      cf_payment_amount: paymentAmount,
      cf_payment_date: new Date().toISOString(),
      cf_payment_method: paymentIntent.payment_method_types?.[0] || 'card',
      cf_stripe_payment_id: paymentIntent.id
    },
    tags: {
      add: ['Status:Payment_Received', 'Customer:Paid', 'Booking:Ready_For_Service'],
      remove: ['Status:Payment_Pending', 'Status:Payment_Failed', 'Action:Payment_Follow_Up']
    }
  },
  createNote: {
    body: `Payment received: ${paymentAmount} via Stripe. Booking ${bookingId} is confirmed and ready for service.`
  },
  triggerWorkflow: 'payment_confirmation_sequence'
};

// ============================================
// EXAMPLE 3: Smart Lead Routing
// ============================================

// AI Prompt:
// "Analyze a new contact's information to determine the best workflow. 
// Check their message for service type keywords, validate their location 
// is in our service area, detect urgency, and route accordingly."

// Generated Code:
const contact = inputs.contact || {};
const customFields = contact.customFields || {};

// Get contact details
const message = (customFields.cf_initial_message || contact.notes || '').toLowerCase();
const location = (customFields.cf_location || contact.address || '').toLowerCase();
const source = customFields.cf_lead_source || contact.source || 'unknown';

// Service detection with scoring
const servicePatterns = {
  LOAN_SIGNING: {
    keywords: ['loan', 'mortgage', 'refinance', 'closing', 'escrow', 'title company'],
    score: 0
  },
  APOSTILLE: {
    keywords: ['apostille', 'international', 'embassy', 'consulate', 'foreign'],
    score: 0
  },
  POWER_OF_ATTORNEY: {
    keywords: ['power of attorney', 'poa', 'medical directive', 'living will'],
    score: 0
  },
  REAL_ESTATE: {
    keywords: ['deed', 'property', 'real estate', 'quitclaim', 'warranty deed'],
    score: 0
  }
};

// Calculate scores for each service type
for (const [service, data] of Object.entries(servicePatterns)) {
  data.score = data.keywords.filter(keyword => message.includes(keyword)).length;
}

// Determine primary service type
const detectedService = Object.entries(servicePatterns)
  .sort((a, b) => b[1].score - a[1].score)[0];

const primaryService = detectedService[1].score > 0 ? detectedService[0] : 'GENERAL_NOTARY';

// Check location
const serviceAreas = ['houston', 'harris', 'fort bend', 'montgomery', 'brazoria', 'galveston'];
const isInServiceArea = serviceAreas.some(area => location.includes(area));

// Detect urgency and time preference
const urgencyIndicators = ['urgent', 'asap', 'today', 'emergency', 'immediately', 'rush'];
const isUrgent = urgencyIndicators.some(indicator => message.includes(indicator));

const timePreferences = {
  morning: ['morning', 'am', 'before noon'],
  afternoon: ['afternoon', 'pm', 'after lunch'],
  evening: ['evening', 'night', 'after 5', 'after work'],
  weekend: ['weekend', 'saturday', 'sunday']
};

let preferredTime = 'flexible';
for (const [time, keywords] of Object.entries(timePreferences)) {
  if (keywords.some(keyword => message.includes(keyword))) {
    preferredTime = time;
    break;
  }
}

// Calculate initial quote estimate
const baseRates = {
  LOAN_SIGNING: 150,
  APOSTILLE: 75,
  POWER_OF_ATTORNEY: 100,
  REAL_ESTATE: 125,
  GENERAL_NOTARY: 50
};

let estimatedQuote = baseRates[primaryService] || 50;
if (isUrgent) estimatedQuote *= 1.5;
if (preferredTime === 'evening' || preferredTime === 'weekend') estimatedQuote *= 1.25;

// Determine workflow routing
let routeToWorkflow;
let priority;

if (!isInServiceArea) {
  routeToWorkflow = 'out_of_area_inquiry';
  priority = 'low';
} else if (isUrgent) {
  routeToWorkflow = 'urgent_request_handler';
  priority = 'high';
} else if (primaryService === 'LOAN_SIGNING') {
  routeToWorkflow = 'loan_signing_specialist';
  priority = 'normal';
} else {
  routeToWorkflow = 'general_notary_intake';
  priority = 'normal';
}

// Return routing decision and contact updates
return {
  routing: {
    workflow: routeToWorkflow,
    priority: priority,
    assignTo: primaryService === 'LOAN_SIGNING' ? 'loan_team' : 'general_team'
  },
  analysis: {
    detectedService: primaryService,
    serviceScore: detectedService[1].score,
    isInServiceArea: isInServiceArea,
    isUrgent: isUrgent,
    preferredTime: preferredTime,
    estimatedQuote: estimatedQuote
  },
  updateContact: {
    customFields: {
      cf_service_type_detected: primaryService,
      cf_urgency_level: isUrgent ? 'High' : 'Normal',
      cf_preferred_time: preferredTime,
      cf_initial_quote_estimate: estimatedQuote.toString(),
      cf_in_service_area: isInServiceArea ? 'Yes' : 'No'
    },
    tags: [
      `Service:${primaryService}`,
      `Priority:${priority}`,
      isInServiceArea ? 'Location:Service_Area' : 'Location:Out_Of_Area',
      `Source:${source}`,
      isUrgent ? 'Urgent:Yes' : 'Urgent:No'
    ]
  },
  createTask: isUrgent ? {
    title: `URGENT: ${primaryService} Request`,
    description: `Urgent ${primaryService} request from ${contact.firstName || 'New Lead'}. Estimated value: $${estimatedQuote}`,
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    assignedTo: primaryService === 'LOAN_SIGNING' ? 'loan_team' : 'general_team',
    priority: 'high'
  } : null
};

// ============================================
// EXAMPLE 4: Automated Follow-Up Sequencing
// ============================================

// AI Prompt:
// "Check if a contact has had any activity in the last 30 days. If not, 
// determine the best re-engagement strategy based on their history and 
// trigger appropriate follow-up."

// Generated Code:
const contact = inputs.contact || {};
const customFields = contact.customFields || {};

// Get contact history
const lastActivityDate = new Date(contact.dateUpdated || contact.dateAdded);
const daysSinceActivity = Math.floor((new Date() - lastActivityDate) / (1000 * 60 * 60 * 24));

// Get service history
const completedServices = parseInt(customFields.cf_completed_services_count) || 0;
const lastServiceType = customFields.cf_last_service_type || 'unknown';
const totalSpent = parseFloat(customFields.cf_lifetime_value) || 0;

// Determine contact segment
let segment;
if (completedServices === 0) {
  segment = 'prospect';
} else if (completedServices === 1) {
  segment = 'new_customer';
} else if (totalSpent > 500) {
  segment = 'vip_customer';
} else {
  segment = 'repeat_customer';
}

// Skip if recently active
if (daysSinceActivity < 30) {
  return {
    skip: true,
    reason: 'Recently active',
    daysSinceActivity: daysSinceActivity
  };
}

// Determine re-engagement strategy
const strategies = {
  prospect: {
    sequence: 'educational_nurture_sequence',
    initialDelay: 0,
    message: 'Learn about our notary services',
    incentive: '10% off first service'
  },
  new_customer: {
    sequence: 'second_service_promotion',
    initialDelay: 0,
    message: 'Thank you for trusting us',
    incentive: '15% off next service'
  },
  repeat_customer: {
    sequence: 'loyalty_reactivation',
    initialDelay: 0,
    message: 'We miss you!',
    incentive: 'Priority scheduling'
  },
  vip_customer: {
    sequence: 'vip_winback_sequence',
    initialDelay: 0,
    message: 'Your VIP status awaits',
    incentive: '20% off + priority service'
  }
};

const strategy = strategies[segment];

// Check for seasonal relevance
const month = new Date().getMonth();
const seasonalServices = {
  0: 'tax_season_notary', // January
  3: 'real_estate_spring', // April
  8: 'school_documents', // September
  11: 'year_end_planning' // December
};

const seasonalCampaign = seasonalServices[month];

return {
  process: true,
  segment: segment,
  daysSinceActivity: daysSinceActivity,
  reEngagement: {
    sequence: strategy.sequence,
    campaign: seasonalCampaign || 'general_reactivation',
    personalizedMessage: `Hi ${contact.firstName || 'there'}, ${strategy.message}`,
    incentive: strategy.incentive
  },
  updateContact: {
    customFields: {
      cf_reengagement_status: 'Started',
      cf_reengagement_date: new Date().toISOString(),
      cf_customer_segment: segment,
      cf_days_inactive: daysSinceActivity.toString()
    },
    tags: [
      `Reengagement:${segment}`,
      'Status:Inactive_30_Days',
      `Campaign:${seasonalCampaign || 'General'}`
    ]
  },
  createNote: {
    body: `Started re-engagement sequence for ${segment} segment. Inactive for ${daysSinceActivity} days. Offering: ${strategy.incentive}`
  }
}; 