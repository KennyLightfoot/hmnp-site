// Simple helpers to centralize business phone usage across the app
// Adds basic DNI (dynamic number insertion) support by source/campaign

const RAW_PHONE = (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.BUSINESS_PHONE || '832-617-4285').trim();
const RAW_SMS_PHONE = (process.env.NEXT_PUBLIC_SMS_NUMBER || process.env.BUSINESS_SMS_PHONE || '281-991-7475').trim();

type DniSource = 'google' | 'facebook' | 'yelp' | 'direct' | 'other'

const DNI_NUMBERS: Partial<Record<DniSource, string>> = {
  google: (process.env.NEXT_PUBLIC_DNI_GOOGLE || '').trim(),
  facebook: (process.env.NEXT_PUBLIC_DNI_FACEBOOK || '').trim(),
  yelp: (process.env.NEXT_PUBLIC_DNI_YELP || '').trim(),
  direct: (process.env.NEXT_PUBLIC_DNI_DIRECT || '').trim(),
}

function pickDniNumberByAttribution(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('utm_attribution') || '{}'
    const a = JSON.parse(raw || '{}') as { utm_source?: string; gclid?: string; fbclid?: string; ref?: string }
    const source = (a.utm_source || (a.gclid ? 'google' : '') || (a.fbclid ? 'facebook' : '') || '').toLowerCase()
    if (source.includes('google') || a.gclid) return DNI_NUMBERS.google || null
    if (source.includes('facebook') || source.includes('meta')) return DNI_NUMBERS.facebook || null
    if (source.includes('yelp')) return DNI_NUMBERS.yelp || null
    if (source.includes('direct') || source === '') return DNI_NUMBERS.direct || null
    return null
  } catch {
    return null
  }
}

export function normalizeToDigits(input: string): string {
  return (input || '').replace(/\D/g, '');
}

function digitsToE164(digits: string): string {
  if (!digits) return '';
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

function formatUsPhone(digits: string, fallback: string): string {
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    const d = digits.slice(1);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }
  return fallback;
}

export function getBusinessPhone(): string {
  if (typeof window !== 'undefined') {
    const bySource = pickDniNumberByAttribution()
    if (bySource && bySource.trim()) return bySource.trim()
  }
  return RAW_PHONE;
}

export function getBusinessTel(): string {
  const digits = normalizeToDigits(getBusinessPhone());
  return digitsToE164(digits) || digitsToE164(normalizeToDigits(RAW_PHONE));
}

export function getBusinessPhoneFormatted(): string {
  // Format as (XXX) XXX-XXXX for display
  const digits = normalizeToDigits(getBusinessPhone());
  return formatUsPhone(digits, getBusinessPhone());
}

export function getSmsTel(): string {
  const digits = normalizeToDigits(RAW_SMS_PHONE);
  return digitsToE164(digits) || digitsToE164(normalizeToDigits(RAW_SMS_PHONE));
}

export function getSmsHref(): string {
  const tel = getSmsTel();
  return tel ? `sms:${tel}` : 'sms:';
}

export function getSmsNumberFormatted(): string {
  const digits = normalizeToDigits(RAW_SMS_PHONE);
  return formatUsPhone(digits, RAW_SMS_PHONE);
}


