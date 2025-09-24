export function generateReservationId(): string {
  return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return `${local?.slice(0, 2) || '**'}***@${domain || '***'}`
}

export function sanitizeEmailInObj<T extends Record<string, any>>(obj: T): T {
  const copy: any = { ...obj }
  if (copy.customerEmail) copy.customerEmail = maskEmail(copy.customerEmail)
  return copy
}


