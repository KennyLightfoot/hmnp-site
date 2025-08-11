// lib/ghl/api.ts
// Deprecated monolith; keep re-export wrappers for compatibility
export { findContactByEmail, createContact, updateContact, addTagsToContact, removeTagsFromContact, updateContactCustomFields } from './contacts'
export { createOpportunity, updateOpportunityCustomFields } from './opportunities'
export { createAppointment, getCalendarEvents } from './appointments-adapter'

export { getServiceValue } from './api-utils'
