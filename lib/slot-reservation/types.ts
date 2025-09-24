export interface SlotReservation {
  id: string
  datetime: string
  serviceType: string
  userId?: string
  customerEmail?: string
  estimatedDuration: number
  reservedAt: string
  expiresAt: string
  extended: boolean
  extensionCount: number
  bookingId?: string
  metadata?: Record<string, any>
}

export interface ReservationResult {
  success: boolean
  reservation?: SlotReservation
  message: string
  timeRemaining?: number
  conflictingReservation?: string
}

export interface ReservationStatus {
  active: boolean
  timeRemaining: number
  warningZone: boolean
  canExtend: boolean
  reservation?: SlotReservation
}


