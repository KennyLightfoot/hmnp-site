// Simple helpers to centralize business phone usage across the app
// Adds basic DNI (dynamic number insertion) support by source/campaign

const RAW_PHONE = (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.BUSINESS_PHONE || '832-617-4285').trim();

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

export function getBusinessPhone(): string {
  if (typeof window !== 'undefined') {
    const bySource = pickDniNumberByAttribution()
    if (bySource && bySource.trim()) return bySource.trim()
  }
  return RAW_PHONE;
}

export function getBusinessTel(): string {
  const digits = normalizeToDigits(getBusinessPhone());
  const e164 = digits.length === 10 ? `+1${digits}` : (digits.startsWith('1') && digits.length === 11 ? `+${digits}` : `+1${digits}`);
  return e164;
}

export function getBusinessPhoneFormatted(): string {
  // Format as (XXX) XXX-XXXX for display
  const digits = normalizeToDigits(getBusinessPhone());
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    const d = digits.slice(1);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }
  return getBusinessPhone(); // fallback as-is
}


