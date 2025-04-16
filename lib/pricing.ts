export const SERVICE_AREA_RADIUS = 20 // miles

interface PricingParams {
  serviceType: string
  numberOfSigners: number
  distance: number
  isWeekend: boolean
  isHoliday: boolean
  isAfterHours: boolean
  extraDocuments: number
  needsOvernightHandling: boolean
  needsBilingualService: boolean
}

export function calculateTotalPrice(params: PricingParams) {
  const {
    serviceType,
    numberOfSigners,
    distance,
    isWeekend,
    isHoliday,
    isAfterHours,
    extraDocuments,
    needsOvernightHandling,
    needsBilingualService,
  } = params

  // Base prices
  let basePrice = 0
  switch (serviceType) {
    case "essential":
      basePrice = 75
      break
    case "priority":
      basePrice = 100
      break
    case "loanSigning":
      basePrice = 150
      break
    case "reverseMortgage":
      basePrice = 150
      break
    case "specialty":
      basePrice = 55
      break
    default:
      basePrice = 75
  }

  // Extra signers fee
  const extraSignersFee = Math.max(0, numberOfSigners - 1) * 10

  // Travel fee (beyond service area)
  const extraDistance = Math.max(0, distance - SERVICE_AREA_RADIUS)
  const travelFee = extraDistance * 0.5 // $0.50 per mile

  // Weekend/holiday fee
  const weekendFee = isWeekend ? 40 : 0
  const holidayFee = isHoliday ? 50 : 0
  const weekendHolidayFee = Math.max(weekendFee, holidayFee) // Don't double charge

  // After hours fee
  const afterHoursFee = isAfterHours ? 30 : 0

  // Extra documents fee
  const extraDocumentsFee = extraDocuments * 5

  // Overnight handling fee
  const overnightHandlingFee = needsOvernightHandling ? 35 : 0

  // Bilingual service fee
  const bilingualFee = needsBilingualService ? 20 : 0

  // Calculate total
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
