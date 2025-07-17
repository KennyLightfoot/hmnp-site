import { describe, it, expect } from 'vitest'
import { CreateBookingSchema } from '@/lib/booking-validation'

const baseBooking = {
  serviceType: 'STANDARD_NOTARY',
  locationType: 'CLIENT_ADDRESS',
  scheduling: {
    preferredDate: '2030-12-31',
    preferredTime: '14:00'
  },
  customer: {
    name: 'Jane Doe',
    email: 'jane@example.com'
  },
  serviceDetails: {
    serviceType: 'STANDARD_NOTARY',
    documentTypes: ['Affidavit'],
    signerCount: 1,
    documentCount: 1
  },
  payment: {
    paymentMethod: 'credit-card'
  }
} as any

describe('CreateBookingSchema – validation errors', () => {
  it('throws when location is missing for in-person service', () => {
    expect(() => CreateBookingSchema.parse(baseBooking)).toThrow()
  })
}) 