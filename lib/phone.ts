// Simple helpers to centralize business phone usage across the app

const RAW_PHONE = (process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.BUSINESS_PHONE || '832-617-4285').trim();

export function normalizeToDigits(input: string): string {
  return (input || '').replace(/\D/g, '');
}

export function getBusinessPhone(): string {
  return RAW_PHONE;
}

export function getBusinessTel(): string {
  const digits = normalizeToDigits(RAW_PHONE);
  const e164 = digits.length === 10 ? `+1${digits}` : (digits.startsWith('1') && digits.length === 11 ? `+${digits}` : `+1${digits}`);
  return e164;
}

export function getBusinessPhoneFormatted(): string {
  // Format as (XXX) XXX-XXXX for display
  const digits = normalizeToDigits(RAW_PHONE);
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    const d = digits.slice(1);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }
  return RAW_PHONE; // fallback as-is
}


