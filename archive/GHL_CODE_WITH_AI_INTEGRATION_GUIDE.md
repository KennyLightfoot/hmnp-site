# GHL Code with AI Integration Guide
**Houston Mobile Notary Pros - Leveraging AI-Generated Code in Workflows**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Integration Architecture](#architecture)
3. [Use Cases for Your Web App](#use-cases)
4. [Implementation Examples](#examples)
5. [Best Practices](#best-practices)
6. [Security Considerations](#security)

---

## 1. Overview {#overview}

GHL's "Code with AI" feature allows you to generate JavaScript code snippets directly within workflows using natural language descriptions. This can significantly enhance your web app integration by:

- **Reducing Development Time**: Generate data transformation code instantly
- **Bridging Systems**: Connect GHL workflows with your web app's API
- **Dynamic Processing**: Handle complex business logic without manual coding
- **Real-time Adaptation**: Modify workflow behavior based on data

### Key Benefits for Your Integration

1. **Data Synchronization**: Transform and sync data between GHL and your database
2. **Custom Validations**: Implement business rules before processing
3. **API Orchestration**: Call multiple endpoints in sequence
4. **Error Handling**: Gracefully manage edge cases

---

## 2. Integration Architecture {#architecture}

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GHL Workflow   │────▶│  AI-Generated    │────▶│  Your Web App   │
│  Trigger        │     │  Custom Code     │     │  API Endpoint   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌──────────────────┐              │
         └─────────────▶│  Process Result  │◀─────────────┘
                        │  & Continue      │
                        └──────────────────┘
```

### Data Flow Pattern

1. **Webhook Trigger** → GHL Workflow starts
2. **Custom Code Action** → AI-generated code processes data
3. **API Call** → Send processed data to your web app
4. **Response Handling** → Process API response
5. **Workflow Continuation** → Next actions based on results

---

## 3. Use Cases for Your Web App {#use-cases}

### A. Booking Data Synchronization

**Scenario**: When a booking is created in GHL, sync with your database

**AI Prompt Example**:
```
I have a contact with custom fields for booking details. Extract the booking date 
(cf_booking_date), service type (cf_service_type), and location (cf_service_location). 
Format the date as ISO 8601 and create a JSON object to send to my booking API.
```

**Generated Code**:
```javascript
// Access input data from previous workflow steps
const contact = inputs.contact;
const customFields = contact.customFields || {};

// Extract booking details
const bookingDate = customFields.cf_booking_date || '';
const serviceType = customFields.cf_service_type || 'STANDARD_NOTARY';
const location = customFields.cf_service_location || '';

// Format date to ISO 8601
const formattedDate = bookingDate ? new Date(bookingDate).toISOString() : null;

// Create booking payload
const bookingPayload = {
  ghlContactId: contact.id,
  clientName: `${contact.firstName} ${contact.lastName}`,
  email: contact.email,
  phone: contact.phone,
  scheduledFor: formattedDate,
  serviceType: serviceType.toUpperCase().replace(/ /g, '_'),
  location: location,
  source: 'GHL_WORKFLOW',
  metadata: {
    ghlTags: contact.tags || [],
    workflowId: inputs.workflow?.id
  }
};

// Call your web app API
const apiResponse = await fetch('https://houstonmobilenotarypros.com/api/bookings/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY' // Use GHL environment variables
  },
  body: JSON.stringify(bookingPayload)
});

const result = await apiResponse.json();

// Return data for next workflow step
return {
  success: apiResponse.ok,
  bookingId: result.bookingId,
  message: result.message || 'Booking synced successfully',
  apiStatus: apiResponse.status
};
```

### B. Payment Status Updates

**Scenario**: Update GHL contact when payment is received in your app

**AI Prompt Example**:
```
I receive a webhook with payment data including amount, status, and transaction ID. 
Update the contact's custom fields cf_payment_status, cf_payment_amount, and 
cf_last_payment_date. Add appropriate tags based on payment status.
```

**Generated Code**:
```javascript
const paymentData = inputs.webhook || {};
const contactId = inputs.contact?.id;

// Extract payment details
const paymentStatus = paymentData.status || 'pending';
const amount = parseFloat(paymentData.amount) || 0;
const transactionId = paymentData.transactionId || '';
const paymentDate = new Date().toISOString();

// Determine tags based on status
let tagsToAdd = [];
let tagsToRemove = [];

switch(paymentStatus.toLowerCase()) {
  case 'completed':
  case 'succeeded':
    tagsToAdd = ['Status:Payment_Received', 'Customer:Paid'];
    tagsToRemove = ['Status:Payment_Pending', 'Status:Payment_Failed'];
    break;
  case 'failed':
    tagsToAdd = ['Status:Payment_Failed', 'Action:Payment_Follow_Up_Required'];
    tagsToRemove = ['Status:Payment_Pending'];
    break;
  case 'pending':
    tagsToAdd = ['Status:Payment_Pending'];
    break;
}

// Format amount as currency
const formattedAmount = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(amount);

// Return update instructions for GHL
return {
  updateContact: true,
  customFields: {
    cf_payment_status: paymentStatus,
    cf_payment_amount: formattedAmount,
    cf_last_payment_date: paymentDate,
    cf_payment_transaction_id: transactionId
  },
  addTags: tagsToAdd,
  removeTags: tagsToRemove,
  note: `Payment ${paymentStatus}: ${formattedAmount} - Transaction: ${transactionId}`
};
```

### C. Intelligent Lead Routing

**Scenario**: Route leads to appropriate workflows based on service needs

**AI Prompt Example**:
```
Analyze the contact's message (cf_initial_message) for keywords indicating service type. 
Check for: loan signing, apostille, power of attorney, real estate, mobile notary. 
Also check their location (cf_location) to determine if it's within our service area 
(Houston, TX and surrounding counties). Return routing decision.
```

**Generated Code**:
```javascript
const contact = inputs.contact || {};
const message = (contact.customFields?.cf_initial_message || '').toLowerCase();
const location = (contact.customFields?.cf_location || '').toLowerCase();

// Service type keywords
const serviceKeywords = {
  LOAN_SIGNING: ['loan', 'mortgage', 'refinance', 'closing', 'real estate closing'],
  APOSTILLE: ['apostille', 'international', 'foreign document'],
  POWER_OF_ATTORNEY: ['power of attorney', 'poa', 'attorney in fact'],
  REAL_ESTATE: ['real estate', 'property', 'deed', 'title'],
  GENERAL_NOTARY: ['notary', 'notarize', 'witness', 'signature']
};

// Service area counties
const serviceAreaCounties = [
  'harris', 'fort bend', 'montgomery', 'brazoria', 
  'galveston', 'liberty', 'waller', 'chambers'
];

// Detect service type
let detectedService = 'GENERAL_NOTARY';
let confidence = 0;

for (const [service, keywords] of Object.entries(serviceKeywords)) {
  const matches = keywords.filter(keyword => message.includes(keyword)).length;
  if (matches > confidence) {
    detectedService = service;
    confidence = matches;
  }
}

// Check service area
const isInServiceArea = serviceAreaCounties.some(county => 
  location.includes(county) || location.includes('houston')
);

// Determine urgency
const urgentKeywords = ['urgent', 'asap', 'today', 'emergency', 'rush'];
const isUrgent = urgentKeywords.some(keyword => message.includes(keyword));

// Calculate quote estimate based on service
const baseRates = {
  LOAN_SIGNING: 150,
  APOSTILLE: 75,
  POWER_OF_ATTORNEY: 100,
  REAL_ESTATE: 125,
  GENERAL_NOTARY: 50
};

const estimatedQuote = baseRates[detectedService] || 50;
const urgencyMultiplier = isUrgent ? 1.5 : 1;
const finalQuote = estimatedQuote * urgencyMultiplier;

// Return routing decision
return {
  serviceType: detectedService,
  isInServiceArea: isInServiceArea,
  isUrgent: isUrgent,
  estimatedQuote: finalQuote,
  routeToWorkflow: isInServiceArea ? `workflow_${detectedService.toLowerCase()}` : 'workflow_out_of_area',
  tags: [
    `Service:${detectedService}`,
    isInServiceArea ? 'Location:In_Service_Area' : 'Location:Out_Of_Area',
    isUrgent ? 'Priority:Urgent' : 'Priority:Normal'
  ],
  customFields: {
    cf_detected_service_type: detectedService,
    cf_estimated_quote: finalQuote.toString(),
    cf_urgency_level: isUrgent ? 'High' : 'Normal'
  }
};
```

### D. Appointment Reminder Customization

**Scenario**: Generate personalized reminder messages based on service type

**AI Prompt Example**:
```
Create a personalized SMS reminder based on the appointment details. Include the 
client's first name, appointment date/time (cf_appointment_datetime), service type 
(cf_service_type), and any special instructions (cf_special_instructions). 
Keep it under 160 characters.
```

**Generated Code**:
```javascript
const contact = inputs.contact || {};
const appointment = inputs.appointment || {};

// Extract details
const firstName = contact.firstName || 'Valued Client';
const appointmentDate = appointment.scheduledTime || contact.customFields?.cf_appointment_datetime;
const serviceType = contact.customFields?.cf_service_type || 'notary service';
const specialInstructions = contact.customFields?.cf_special_instructions || '';

// Format date and time
const date = new Date(appointmentDate);
const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
const formattedDate = date.toLocaleDateString('en-US', dateOptions);
const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

// Service-specific reminders
const serviceReminders = {
  'LOAN_SIGNING': 'Bring all loan docs & valid ID',
  'APOSTILLE': 'Original docs required',
  'POWER_OF_ATTORNEY': 'All parties must be present',
  'REAL_ESTATE': 'Bring property docs & ID',
  'GENERAL_NOTARY': 'Bring docs & valid ID'
};

const reminder = serviceReminders[serviceType.toUpperCase()] || 'Bring docs & ID';

// Build message (max 160 chars)
let message = `Hi ${firstName}! Reminder: ${serviceType} tomorrow ${formattedTime}. ${reminder}`;

// Trim if too long
if (message.length > 160) {
  message = `${firstName}: ${serviceType} ${formattedDate} ${formattedTime}. ${reminder}`;
}

// Add special instructions if space allows
if (specialInstructions && message.length < 140) {
  const availableSpace = 160 - message.length - 3; // -3 for ". "
  const truncatedInstructions = specialInstructions.substring(0, availableSpace);
  message += `. ${truncatedInstructions}`;
}

return {
  smsMessage: message,
  messageLength: message.length,
  includesSpecialInstructions: message.includes(specialInstructions)
};
```

---

## 4. Implementation Examples {#examples}

### Example 1: Complete Booking Workflow Integration

**Workflow Name**: "Booking Form Submission Handler"

**Step 1: Webhook Trigger**
- Trigger: Form Submission
- Form: Website Booking Form

**Step 2: Custom Code - Validate & Process**
```javascript
// AI Prompt: "Validate booking form data. Check that date is in the future, 
// service type is valid, and calculate total price based on service and distance."

const formData = inputs.form || {};
const now = new Date();
const bookingDate = new Date(formData.preferred_date);

// Validation
const errors = [];
if (bookingDate <= now) {
  errors.push('Booking date must be in the future');
}

const validServices = ['LOAN_SIGNING', 'APOSTILLE', 'POWER_OF_ATTORNEY', 'REAL_ESTATE', 'GENERAL_NOTARY'];
if (!validServices.includes(formData.service_type)) {
  errors.push('Invalid service type');
}

// Calculate pricing
const basePrices = {
  LOAN_SIGNING: 150,
  APOSTILLE: 75,
  POWER_OF_ATTORNEY: 100,
  REAL_ESTATE: 125,
  GENERAL_NOTARY: 50
};

const distance = parseFloat(formData.distance_miles) || 0;
const mileageRate = 0.65;
const basePrice = basePrices[formData.service_type] || 50;
const mileageFee = distance > 25 ? (distance - 25) * mileageRate : 0;
const totalPrice = basePrice + mileageFee;

return {
  isValid: errors.length === 0,
  errors: errors,
  pricing: {
    basePrice: basePrice,
    mileageFee: mileageFee,
    totalPrice: totalPrice
  },
  processedData: {
    ...formData,
    booking_date_iso: bookingDate.toISOString(),
    calculated_price: totalPrice
  }
};
```

**Step 3: HTTP Request - Create Booking in Web App**
- URL: `https://houstonmobilenotarypros.com/api/bookings`
- Method: POST
- Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{custom_values.api_key}}
- Body: `{{step2.processedData}}`

**Step 4: Custom Code - Handle Response**
```javascript
// AI Prompt: "Process the API response. If successful, update contact fields 
// and add tags. If failed, create a task for manual review."

const apiResponse = inputs.step3 || {};
const contact = inputs.contact || {};

if (apiResponse.status === 200 || apiResponse.status === 201) {
  const booking = apiResponse.body;
  
  return {
    success: true,
    updateContact: {
      customFields: {
        cf_booking_id: booking.id,
        cf_booking_status: 'CONFIRMED',
        cf_booking_date: booking.scheduledFor,
        cf_total_price: booking.totalPrice.toString()
      },
      tags: ['Status:Booking_Confirmed', 'Customer:Active']
    },
    sendConfirmation: true
  };
} else {
  return {
    success: false,
    createTask: {
      title: 'Manual Booking Review Required',
      description: `Booking API failed: ${apiResponse.body?.error || 'Unknown error'}`,
      dueDate: new Date().toISOString(),
      assignedTo: 'team'
    },
    updateContact: {
      tags: ['Status:Booking_Failed', 'Action:Manual_Review_Required']
    }
  };
}
```

### Example 2: Payment Reconciliation Workflow

**Workflow Name**: "Daily Payment Reconciliation"

**Step 1: Schedule Trigger**
- Trigger: Daily at 9:00 AM

**Step 2: Custom Code - Fetch Pending Payments**
```javascript
// AI Prompt: "Call my API to get all bookings with payment_pending status 
// from the last 7 days. Format the data for processing."

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const response = await fetch('https://houstonmobilenotarypros.com/api/bookings/pending-payments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  params: {
    since: sevenDaysAgo.toISOString(),
    status: 'PAYMENT_PENDING'
  }
});

const pendingBookings = await response.json();

// Group by days overdue
const grouped = pendingBookings.reduce((acc, booking) => {
  const daysOverdue = Math.floor((new Date() - new Date(booking.createdAt)) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue >= 3) {
    acc.critical.push(booking);
  } else if (daysOverdue >= 1) {
    acc.warning.push(booking);
  } else {
    acc.recent.push(booking);
  }
  
  return acc;
}, { critical: [], warning: [], recent: [] });

return {
  totalPending: pendingBookings.length,
  criticalCount: grouped.critical.length,
  warningCount: grouped.warning.length,
  recentCount: grouped.recent.length,
  bookings: grouped
};
```

**Step 3: Loop - Process Each Category**
- Loop through: Critical, Warning, Recent

**Step 4: Custom Code - Send Appropriate Reminders**
```javascript
// AI Prompt: "Based on the payment category (critical/warning/recent), 
// create appropriate reminder messages and determine next actions."

const category = inputs.loopItem.category;
const bookings = inputs.loopItem.bookings;

const templates = {
  critical: {
    subject: 'Urgent: Payment Required - Service May Be Cancelled',
    sms: 'Your notary service payment is 3+ days overdue. Pay now to avoid cancellation: {{payment_link}}',
    tags: ['Payment:Critical_Overdue', 'Action:Urgent_Follow_Up'],
    cancelIfNoPay: true
  },
  warning: {
    subject: 'Payment Reminder - Please Complete Your Payment',
    sms: 'Reminder: Your notary service payment is pending. Pay now: {{payment_link}}',
    tags: ['Payment:Overdue', 'Action:Payment_Reminder_Sent'],
    cancelIfNoPay: false
  },
  recent: {
    subject: 'Complete Your Booking - Payment Needed',
    sms: 'Thanks for booking! Complete your payment to confirm: {{payment_link}}',
    tags: ['Payment:Pending', 'Status:Awaiting_Payment'],
    cancelIfNoPay: false
  }
};

const template = templates[category];
const results = [];

for (const booking of bookings) {
  const paymentLink = `https://houstonmobilenotarypros.com/pay/${booking.id}`;
  const message = template.sms.replace('{{payment_link}}', paymentLink);
  
  results.push({
    bookingId: booking.id,
    contactId: booking.ghlContactId,
    message: message,
    subject: template.subject,
    tags: template.tags,
    shouldCancel: template.cancelIfNoPay && !booking.paymentReminderSent
  });
}

return {
  category: category,
  processedCount: results.length,
  reminders: results
};
```

---

## 5. Best Practices {#best-practices}

### A. Prompt Engineering Tips

1. **Be Specific**: Include exact field names and data types
   ```
   Good: "Extract cf_booking_date (ISO date string) and convert to MM/DD/YYYY format"
   Bad: "Format the date"
   ```

2. **Include Error Handling**: Ask for validation and edge cases
   ```
   "Validate that the email is in correct format. If invalid, return an error object with a descriptive message"
   ```

3. **Specify Return Format**: Define the expected output structure
   ```
   "Return an object with success (boolean), data (object), and errors (array of strings)"
   ```

### B. Code Organization

1. **Use Environment Variables**: Never hardcode sensitive data
   ```javascript
   // Use GHL's custom values
   const apiKey = inputs.custom_values.api_key;
   const apiUrl = inputs.custom_values.api_base_url;
   ```

2. **Modular Returns**: Structure returns for easy workflow continuation
   ```javascript
   return {
     continue: true,
     nextStep: 'send_confirmation',
     data: processedData,
     metadata: { processedAt: new Date().toISOString() }
   };
   ```

3. **Consistent Error Handling**:
   ```javascript
   try {
     // Your code
   } catch (error) {
     return {
       success: false,
       error: error.message,
       shouldRetry: true,
       retryAfter: 300 // seconds
     };
   }
   ```

### C. Performance Optimization

1. **Batch Operations**: Process multiple items efficiently
   ```javascript
   // Instead of multiple API calls
   const batchResponse = await fetch('/api/bookings/batch-update', {
     method: 'POST',
     body: JSON.stringify({ bookings: bookingUpdates })
   });
   ```

2. **Limit Data Processing**: Only process what's needed
   ```javascript
   // Filter early
   const relevantBookings = bookings.filter(b => 
     b.status === 'PENDING' && b.createdAt > cutoffDate
   );
   ```

3. **Use Async Wisely**: Parallel processing when possible
   ```javascript
   const results = await Promise.all([
     updateDatabase(data),
     sendNotification(contact),
     logActivity(event)
   ]);
   ```

---

## 6. Security Considerations {#security}

### A. API Security

1. **Use Secure Headers**:
   ```javascript
   const headers = {
     'Authorization': `Bearer ${inputs.custom_values.api_key}`,
     'X-Webhook-Signature': generateSignature(data),
     'X-Request-ID': generateRequestId()
   };
   ```

2. **Validate Inputs**:
   ```javascript
   // Sanitize user inputs
   const sanitizedMessage = (inputs.message || '').replace(/<[^>]*>/g, '');
   
   // Validate data types
   const amount = parseFloat(inputs.amount);
   if (isNaN(amount) || amount < 0) {
     throw new Error('Invalid amount');
   }
   ```

3. **Rate Limiting Awareness**:
   ```javascript
   // Add delays for bulk operations
   for (let i = 0; i < items.length; i++) {
     await processItem(items[i]);
     if (i % 10 === 0) {
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
   }
   ```

### B. Data Privacy

1. **Minimize Data Exposure**:
   ```javascript
   // Only send necessary fields
   const publicData = {
     id: contact.id,
     firstName: contact.firstName,
     // Don't include sensitive fields
   };
   ```

2. **Audit Logging**:
   ```javascript
   const auditLog = {
     action: 'BOOKING_CREATED',
     userId: inputs.contact.id,
     timestamp: new Date().toISOString(),
     metadata: {
       workflowId: inputs.workflow.id,
       // Don't log sensitive data
     }
   };
   ```

### C. Error Information

1. **Safe Error Messages**:
   ```javascript
   // Don't expose internal details
   return {
     success: false,
     error: 'Payment processing failed',
     errorCode: 'PAYMENT_001',
     // Don't include: stack traces, internal IDs, etc.
   };
   ```

---

## Summary

GHL's "Code with AI" feature provides powerful capabilities for enhancing your web app integration:

1. **Rapid Development**: Generate complex data transformations instantly
2. **Flexible Integration**: Connect GHL workflows with any API endpoint
3. **Business Logic**: Implement custom rules without manual coding
4. **Scalable Solution**: Handle growing complexity with AI assistance

By following these patterns and best practices, you can create sophisticated workflow automations that seamlessly bridge GHL and your web application, providing a superior experience for your clients while maintaining clean, secure, and maintainable code.

Remember to:
- Test generated code thoroughly
- Keep sensitive data in environment variables
- Document your AI prompts for team reference
- Monitor API usage and performance
- Regularly review and optimize workflows

This integration approach allows you to leverage the best of both platforms while maintaining a single source of truth for your business logic and data. 