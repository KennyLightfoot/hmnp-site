// lib/analytics/lead-events.ts
import { trackLead, trackClick, getTrackingContext } from './events';

type LeadCommon = {
  service_type?: 'standard' | 'extended' | 'loan_signing' | 'ron' | 'unknown';
  source_component: 'hero' | 'quick_quote_home' | 'inflow_quote_card' | 'mobile_cta' | 'nav';
  estimated_price?: number;
  zip?: string;
};

export const leadQuickQuoteViewed = (data: LeadCommon) => {
  trackClick('quick_quote_view', data);
};

export const leadQuickQuoteSubmitted = (data: LeadCommon & { name?: string; email?: string; phone?: string }) => {
  const ctx = getTrackingContext();
  trackLead('quick_quote', { ...data, event_id: ctx.event_id });
  return ctx.event_id; // return so you can send same id server-side to CAPI later
};

export const leadInflowRequested = (data: LeadCommon & { partial_fields?: string[] }) => {
  const ctx = getTrackingContext();
  trackLead('inflow_quote', { ...data, event_id: ctx.event_id });
  return ctx.event_id;
};

export const callClicked = (data: LeadCommon) => {
  trackLead('call_click', data);
};

