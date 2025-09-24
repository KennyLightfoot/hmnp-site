/**
 * Contact Event Handlers
 * Business logic for handling contact-related webhook events from GoHighLevel
 */

/**
 * Handle contact creation events
 * @param {Object} data - Processed webhook data
 */
export async function handleContactCreate(data) {
  try {
    console.log(`Processing new contact: ${data.contactId}`);
    
    const contactData = data.contact || {};
    
    // Example: Add contact to your database
    // const result = await prisma.contact.create({
    //   data: {
    //     externalId: contactData.id,
    //     email: contactData.email,
    //     phone: contactData.phone,
    //     firstName: contactData.firstName,
    //     lastName: contactData.lastName,
    //     source: 'ghl',
    //     createdAt: new Date()
    //   }
    // });
    
    // Example: Send welcome email
    // await sendWelcomeEmail(contactData.email, contactData.firstName);
    
    // Example: Create initial task for new contact
    // await createFollowUpTask(contactData.id);
    
    return { success: true, contactId: data.contactId };
  } catch (error) {
    console.error('Error handling contact creation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle contact update events
 * @param {Object} data - Processed webhook data
 */
export async function handleContactUpdate(data) {
  try {
    console.log(`Processing contact update: ${data.contactId}`);
    
    const contactData = data.contact || {};
    
    // Example: Update contact in your database
    // const result = await prisma.contact.update({
    //   where: { externalId: contactData.id },
    //   data: {
    //     email: contactData.email,
    //     phone: contactData.phone,
    //     firstName: contactData.firstName,
    //     lastName: contactData.lastName,
    //     updatedAt: new Date()
    //   }
    // });
    
    return { success: true, contactId: data.contactId };
  } catch (error) {
    console.error('Error handling contact update:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle contact deletion events
 * @param {Object} data - Processed webhook data
 */
export async function handleContactDelete(data) {
  try {
    console.log(`Processing contact deletion: ${data.contactId}`);
    
    // Example: Soft delete the contact in your database
    // const result = await prisma.contact.update({
    //   where: { externalId: data.contactId },
    //   data: {
    //     deleted: true,
    //     deletedAt: new Date()
    //   }
    // });
    
    return { success: true, contactId: data.contactId };
  } catch (error) {
    console.error('Error handling contact deletion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle contact merge events
 * @param {Object} data - Processed webhook data
 */
export async function handleContactMerge(data) {
  try {
    console.log(`Processing contact merge: ${data.contactId}`);
    
    // Handle the merged contact data
    // This typically involves updating references from the old contact ID to the new one
    
    return { success: true, contactId: data.contactId };
  } catch (error) {
    console.error('Error handling contact merge:', error);
    return { success: false, error: error.message };
  }
}
