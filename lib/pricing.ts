// Pricing constants and calculation functions

// Base prices for different service types
export const BASE_PRICES = {
  essential: 75,
  priority: 100,
  loanSigning: 150,
  reverseMortgage: 150,
  specialty: 75,
  businessConcierge: 200,
  healthcare: 175,
  education: 150,
  construction: 250,
}

// Additional fees
export const ADDITIONAL_FEES = {
  extraSigner: {
    essential: 10,
    priority: 10,
    loanSigning: 10,
    specialty: 10,
  },
  weekend: 40,
  holiday: 40,
  afterHours: 30,
  extraDocument: 15,
  extendedTravel: 0.5, // per mile beyond 20 miles
  overnightHandling: 35,
  bilingual: 20,
}

// Service area radius in miles
export const SERVICE_AREA_RADIUS = 20

// Federal holidays
export const FEDERAL_HOLIDAYS = [
  "New Year's Day",
  "Martin Luther King Jr. Day",
  "Presidents' Day",
  "Memorial Day",
  "Juneteenth",
  "Independence Day",
  "Labor Day",
  "Columbus Day",
  "Veterans Day",
  "Thanksgiving Day",
  "Christmas Day",
]

// Calculate essential service price based on number of signers
export function calculateEssentialPrice(numberOfSigners: number): number {
  if (numberOfSigners === 1) return 75
  if (numberOfSigners === 2) return 85
  if (numberOfSigners === 3) return 95
  return 100 // 4+ signers
}

// Calculate priority service price based on number of signers
export function calculatePriorityPrice(numberOfSigners: number): number {
  return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0)
}

// Calculate travel fee based on distance
export function calculateTravelFee(distance: number): number {
  if (distance <= SERVICE_AREA_RADIUS) return 0
  return (distance - SERVICE_AREA_RADIUS) * ADDITIONAL_FEES.extendedTravel
}

// Calculate total price
export function calculateTotalPrice({
  serviceType,
  numberOfSigners,
  distance,
  isWeekend,
  isHoliday,
  isAfterHours,
  extraDocuments,
  needsOvernightHandling,
  needsBilingualService,
}: {
  serviceType: string
  numberOfSigners: number
  distance: number
  isWeekend: boolean
  isHoliday: boolean
  isAfterHours: boolean
  extraDocuments: number
  needsOvernightHandling: boolean
  needsBilingualService: boolean
}): {
  basePrice: number
  extraSignersFee: number
  travelFee: number
  weekendHolidayFee: number
  afterHoursFee: number
  extraDocumentsFee: number
  overnightHandlingFee: number
  bilingualFee: number
  totalPrice: number
} {
  // Calculate base price
  let basePrice = 0
  let extraSignersFee = 0

  switch (serviceType) {
    case "essential":
      basePrice = calculateEssentialPrice(numberOfSigners)
      extraSignersFee = 0 // Already included in the base price calculation
      break
    case "priority":
      basePrice = calculatePriorityPrice(numberOfSigners)
      extraSignersFee = 0 // Already included in the base price calculation
      break
    case "loanSigning":
    case "reverseMortgage":
      basePrice = BASE_PRICES.loanSigning
      extraSignersFee = numberOfSigners > 4 ? (numberOfSigners - 4) * ADDITIONAL_FEES.extraSigner.loanSigning : 0
      break
    case "specialty":
      basePrice = BASE_PRICES.specialty
      extraSignersFee = numberOfSigners > 1 ? (numberOfSigners - 1) * ADDITIONAL_FEES.extraSigner.specialty : 0
      break
    default:
      basePrice = BASE_PRICES.essential
      extraSignersFee = 0
  }

  // Calculate additional fees
  const travelFee = calculateTravelFee(distance)
  const weekendHolidayFee = isWeekend || isHoliday ? ADDITIONAL_FEES.weekend : 0
  const afterHoursFee = isAfterHours ? ADDITIONAL_FEES.afterHours : 0
  const extraDocumentsFee = extraDocuments * ADDITIONAL_FEES.extraDocument
  const overnightHandlingFee = needsOvernightHandling ? ADDITIONAL_FEES.overnightHandling : 0
  const bilingualFee = needsBilingualService ? ADDITIONAL_FEES.bilingual : 0

  // Calculate total price
  const totalPrice =
    basePrice +
    extraSignersFee +
    travelFee +
    weekendHolidayFee +
    afterHoursFee +
    extraDocumentsFee +
    overnightHandlingFee +
    bilingualFee

  return {
    basePrice,
    extraSignersFee,
    travelFee,
    weekendHolidayFee,
    afterHoursFee,
    extraDocumentsFee,
    overnightHandlingFee,
    bilingualFee,
    totalPrice,
  }
}
