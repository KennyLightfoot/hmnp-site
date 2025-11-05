// lib/analytics/events.ts
/* Centralized analytics for GA4 + Meta Pixel (client-side) */

type Dict = Record<string, any>;

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

let consentSet = false;

export type TrackingContext = {
  event_id?: string;
  utm?: Dict;
  device?: 'mobile' | 'tablet' | 'desktop';
  path?: string;
  ref?: string;
};

export const getDeviceType = (): TrackingContext['device'] => {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w <= 767) return 'mobile';
  if (w <= 1024) return 'tablet';
  return 'desktop';
};

export const getUTMParams = (): Dict => {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','wbraid','fbclid'];
  const out: Dict = {};
  keys.forEach(k => { const v = url.searchParams.get(k); if (v) out[k] = v; });
  return out;
};

export const getTrackingContext = (): TrackingContext => ({
  event_id: crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  utm: getUTMParams(),
  device: getDeviceType(),
  path: typeof window !== 'undefined' ? window.location.pathname : '',
  ref: typeof document !== 'undefined' ? document.referrer : '',
});

const gtag = (name: string, event: string, params?: Dict) => {
  if (!GA4_ID || typeof window === 'undefined' || typeof (window as any).gtag !== 'function') return;
  (window as any).gtag(name, event, params);
};

const fbq = (method: string, event: string, params?: Dict) => {
  if (!META_ID || typeof window === 'undefined' || typeof (window as any).fbq !== 'function') return;
  (window as any).fbq(method, event, params);
};

// Optional: basic consent mode defaults (update if you add a CMP)
export const ensureConsent = () => {
  if (consentSet || typeof window === 'undefined') return;
  try {
    (window as any).gtag?.('consent', 'default', {
      ad_user_data: 'granted',
      ad_personalization: 'denied',
      ad_storage: 'denied',
      analytics_storage: 'granted',
    });
    consentSet = true;
  } catch {}
};

const basePayload = (data?: Dict): Dict => {
  const ctx = getTrackingContext();
  return {
    ...data,
    event_id: ctx.event_id,
    device: ctx.device,
    path: ctx.path,
    referrer: ctx.ref,
    ...ctx.utm,
  };
};

// ---- Public events ----

export const trackView = (name: string, data?: Dict) => {
  ensureConsent();
  const payload = basePayload({ name, ...data });
  gtag('event', 'page_view', payload);
  fbq('track', 'PageView', payload);
};

export const trackClick = (name: string, data?: Dict) => {
  ensureConsent();
  const payload = basePayload({ name, ...data });
  gtag('event', 'select_content', { content_type: name, ...payload });
  fbq('track', 'ClickButton', payload);
};

export const trackLead = (stage: 'quick_quote' | 'inflow_quote' | 'call_click' | 'booking_started', data?: Dict) => {
  ensureConsent();
  const payload = basePayload({ stage, ...data });
  // GA4
  gtag('event', 'generate_lead', payload);
  // Meta
  fbq('track', 'Lead', payload);
};

export const trackPurchase = (value: number, currency = 'USD', data?: Dict) => {
  ensureConsent();
  const payload = basePayload({ value, currency, ...data });
  gtag('event', 'purchase', payload);
  fbq('track', 'Purchase', payload);
};

