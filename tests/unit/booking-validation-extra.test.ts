import { describe, it, expect } from 'vitest'
import { CreateBookingSchema } from '@/lib/booking-validation'

const baseBooking: any = {
  serviceType: 'STANDARD_NOTARY',
  locationType: 'CLIENT_ADDRESS',
  customer: {
    email: 'jane@example.com',
    name: 'Jane Doe'
  },
  location: {
    address: '123 Main St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001'
  },
  serviceDetails: {
    serviceType: 'STANDARD_NOTARY',
    documentCount: 2,
    documentTypes: ['Affidavit'],
    signerCount: 1
  },
  scheduling: {
    preferredDate: '2030-12-31',
    preferredTime: '14:00'
  },
  payment: {
    paymentMethod: 'credit-card'
  }
}

describe('CreateBookingSchema – additional cases', () => {
  it('passes with a fully valid booking', () => {
    expect(() => CreateBookingSchema.parse(baseBooking)).not.toThrow()
  })

  it('fails with invalid customer email', () => {
    const bad = { ...baseBooking, customer: { ...baseBooking.customer, email: 'not-an-email' } }
    expect(() => CreateBookingSchema.parse(bad)).toThrow()
  })

  it('fails when scheduled date is in the past', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dateStr = yesterday.toISOString().split('T')[0]
    const bad = {
      ...baseBooking,
      scheduling: { ...baseBooking.scheduling, preferredDate: dateStr }
    }
    expect(() => CreateBookingSchema.parse(bad)).toThrow()
  })
}) 