import { describe, it, expect } from 'vitest'
import { CreateBookingSchema } from '@/lib/booking-validation'

const validBooking = {
  serviceType: 'STANDARD_NOTARY',
  locationType: 'CLIENT_ADDRESS',
  location: {
    address: '123 Main St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001'
  },
  scheduling: {
    preferredDate: '2030-12-31',
    preferredTime: '14:00',
    timeZone: 'America/Chicago'
  },
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '8320001111'
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

describe('CreateBookingSchema – happy path', () => {
  it('parses a valid booking payload', () => {
    expect(() => CreateBookingSchema.parse(validBooking)).not.toThrow()
  })
}) 