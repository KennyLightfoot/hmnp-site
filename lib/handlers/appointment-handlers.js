/**
 * Appointment Event Handlers
 * Business logic for handling appointment-related webhook events from GoHighLevel
 */

/**
 * Handle appointment creation events
 * @param {Object} data - Processed webhook data
 */
export async function handleAppointmentCreate(data) {
  try {
    console.log(`Processing new appointment: ${data.appointmentId}`);
    
    const appointmentData = data || {};
    
    // Example: Add appointment to your database
    // const result = await prisma.appointment.create({
    //   data: {
    //     externalId: appointmentData.appointmentId,
    //     contactId: appointmentData.contactId,
    //     startTime: new Date(appointmentData.startTime),
    //     endTime: new Date(appointmentData.endTime),
    //     title: appointmentData.title,
    //     status: appointmentData.status,
    //     source: 'ghl',
    //     createdAt: new Date()
    //   }
    // });
    
    // Example: Send confirmation email
    // await sendAppointmentConfirmation(appointmentData.contactId, appointmentData);
    
    // Example: Add booking tag to contact
    // await addTagToContact(appointmentData.contactId, 'booking_confirmed');
    
    // Example: Create appointment reminder
    // await createAppointmentReminder(appointmentData.contactId, appointmentData);
    
    return { success: true, appointmentId: data.appointmentId };
  } catch (error) {
    console.error('Error handling appointment creation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle appointment update events
 * @param {Object} data - Processed webhook data
 */
export async function handleAppointmentUpdate(data) {
  try {
    console.log(`Processing appointment update: ${data.appointmentId}`);
    
    const appointmentData = data || {};
    
    // Example: Update appointment in your database
    // const result = await prisma.appointment.update({
    //   where: { externalId: appointmentData.appointmentId },
    //   data: {
    //     startTime: new Date(appointmentData.startTime),
    //     endTime: new Date(appointmentData.endTime),
    //     title: appointmentData.title,
    //     status: appointmentData.status,
    //     updatedAt: new Date()
    //   }
    // });
    
    // Example: Send update notification if relevant fields changed
    // if (hasTimeChanged(appointmentData)) {
    //   await sendAppointmentUpdateNotification(appointmentData.contactId, appointmentData);
    // }
    
    return { success: true, appointmentId: data.appointmentId };
  } catch (error) {
    console.error('Error handling appointment update:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle appointment status change events
 * @param {Object} data - Processed webhook data
 */
export async function handleAppointmentStatusUpdate(data) {
  try {
    console.log(`Processing appointment status update: ${data.appointmentId}`);
    console.log(`New status: ${data.status}`);
    
    const appointmentData = data || {};
    
    // Process based on status
    switch (appointmentData.status) {
      case 'confirmed':
        await processConfirmedStatus(appointmentData);
        break;
      case 'cancelled':
      case 'canceled': // Handle both spelling variants
        await processCancelledStatus(appointmentData);
        break;
      case 'completed':
        await processCompletedStatus(appointmentData);
        break;
      case 'no_show':
        await processNoShowStatus(appointmentData);
        break;
      case 'rescheduled':
        await processRescheduledStatus(appointmentData);
        break;
      default:
        console.log(`Unhandled appointment status: ${appointmentData.status}`);
    }
    
    return { success: true, appointmentId: data.appointmentId };
  } catch (error) {
    console.error('Error handling appointment status update:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle appointment deletion events
 * @param {Object} data - Processed webhook data
 */
export async function handleAppointmentDelete(data) {
  try {
    console.log(`Processing appointment deletion: ${data.appointmentId}`);
    
    const appointmentData = data || {};
    
    // Example: Mark appointment as deleted in your database
    // const result = await prisma.appointment.update({
    //   where: { externalId: appointmentData.appointmentId },
    //   data: {
    //     deleted: true,
    //     deletedAt: new Date()
    //   }
    // });
    
    // Example: Send cancellation notification
    // await sendAppointmentCancellationNotification(appointmentData.contactId, appointmentData);
    
    // Example: Remove booking tag from contact if needed
    // await removeTagFromContact(appointmentData.contactId, 'booking_confirmed');
    
    return { success: true, appointmentId: data.appointmentId };
  } catch (error) {
    console.error('Error handling appointment deletion:', error);
    return { success: false, error: error.message };
  }
}

// ===== Appointment Status Handlers =====

/**
 * Process confirmed appointment status
 * @param {Object} data - Appointment data
 */
async function processConfirmedStatus(data) {
  console.log(`Processing confirmed status for appointment: ${data.appointmentId}`);
  
  // Example: Update appointment status in your database
  // await updateAppointmentStatus(data.appointmentId, 'confirmed');
  
  // Example: Add booking confirmed tag to contact
  // await addTagToContact(data.contactId, 'booking_confirmed');
  
  // Example: Send confirmation email/SMS
  // await sendConfirmationMessage(data.contactId, data);
  
  // Example: Sync with external calendar
  // await syncWithCalendar(data);
}

/**
 * Process cancelled appointment status
 * @param {Object} data - Appointment data
 */
async function processCancelledStatus(data) {
  console.log(`Processing cancelled status for appointment: ${data.appointmentId}`);
  
  // Example: Update appointment status in your database
  // await updateAppointmentStatus(data.appointmentId, 'cancelled');
  
  // Example: Remove booking confirmed tag from contact
  // await removeTagFromContact(data.contactId, 'booking_confirmed');
  
  // Example: Add booking cancelled tag to contact
  // await addTagToContact(data.contactId, 'booking_cancelled');
  
  // Example: Send cancellation confirmation
  // await sendCancellationConfirmation(data.contactId, data);
  
  // Example: Open up calendar slot
  // await releaseCalendarSlot(data);
}

/**
 * Process completed appointment status
 * @param {Object} data - Appointment data
 */
async function processCompletedStatus(data) {
  console.log(`Processing completed status for appointment: ${data.appointmentId}`);
  
  // Example: Update appointment status in your database
  // await updateAppointmentStatus(data.appointmentId, 'completed');
  
  // Example: Add service completed tag to contact
  // await addTagToContact(data.contactId, 'service_completed');
  
  // Example: Send feedback request
  // await sendFeedbackRequest(data.contactId, data);
  
  // Example: Update opportunity pipeline stage
  // await updateOpportunityStage(data.contactId, 'Service Complete');
}

/**
 * Process no-show appointment status
 * @param {Object} data - Appointment data
 */
async function processNoShowStatus(data) {
  console.log(`Processing no-show status for appointment: ${data.appointmentId}`);
  
  // Example: Update appointment status in your database
  // await updateAppointmentStatus(data.appointmentId, 'no_show');
  
  // Example: Add no-show tag to contact
  // await addTagToContact(data.contactId, 'booking_no_show');
  
  // Example: Create follow-up task
  // await createFollowUpTask(data.contactId, 'No-show follow-up');
}

/**
 * Process rescheduled appointment status
 * @param {Object} data - Appointment data
 */
async function processRescheduledStatus(data) {
  console.log(`Processing rescheduled status for appointment: ${data.appointmentId}`);
  
  // Example: Update appointment status in your database
  // await updateAppointmentStatus(data.appointmentId, 'rescheduled');
  
  // Example: Add rescheduled tag to contact
  // await addTagToContact(data.contactId, 'booking_rescheduled');
  
  // Example: Send rescheduling confirmation
  // await sendReschedulingConfirmation(data.contactId, data);
  
  // Example: Update calendar
  // await updateCalendarEvent(data);
}
