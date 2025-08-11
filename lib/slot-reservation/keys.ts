const SLOT_PREFIX = 'slot_hold:'
const RES_PREFIX = 'slot_reservation:'
const USER_PREFIX = 'user_reservation:'

export function getSlotKey(datetime: string, serviceType: string): string {
  return `${SLOT_PREFIX}${datetime}:${serviceType}`
}
export function getReservationKey(reservationId: string): string {
  return `${RES_PREFIX}${reservationId}`
}
export function getUserKey(userId: string): string {
  return `${USER_PREFIX}${userId}`
}
export function getEmailKey(email: string): string {
  return `${USER_PREFIX}email:${email}`
}


