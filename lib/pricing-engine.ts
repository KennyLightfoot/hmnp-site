export interface PricingInput {
  serviceId: string
  numberOfSigners: number
  numberOfDocuments: number
  distanceMiles: number
  urgencyLevel: "standard" | "priority" | "emergency"
  isWeekend?: boolean
  isHoliday?: boolean
  isAfterHours?: boolean
  isNightService?: boolean
  requiresWitness?: boolean
  witnessType?: "standard" | "sourced"
}

export interface PricingResult {
  basePrice: number
  travelFee: number
  urgencyFee: number
  weekendFee: number
  afterHoursFee: number
  nightServiceFee: number
  extraSignerFee: number
  extraDocumentFee: number
  witnessFee: number
  totalPrice: number
  breakdown: PricingBreakdown[]
  isWithinServiceArea: boolean
  maxServiceRadius: number
}

export interface PricingBreakdown {
  description: string
  amount: number
  type: "base" | "travel" | "urgency" | "extra" | "fee"
}

const SERVICE_CONFIGS = {
  "quick-stamp": {
    basePrice: 50,
    maxDocuments: 1,
    maxSigners: 1,
    includedRadius: 10,
    maxRadius: 20,
    extraDocumentFee: 10,
    extraSignerFee: 10,
  },
  "mobile-notary": {
    basePrice: 75,
    maxDocuments: 4,
    maxSigners: 2,
    includedRadius: 20,
    maxRadius: 40,
    extraDocumentFee: 10,
    extraSignerFee: 5,
  },
  "extended-hours": {
    basePrice: 100,
    maxDocuments: 4,
    maxSigners: 2,
    includedRadius: 30,
    maxRadius: 60,
    extraDocumentFee: 10,
    extraSignerFee: 5,
  },
  "loan-signing": {
    basePrice: 150,
    maxDocuments: 999, // Unlimited
    maxSigners: 4,
    includedRadius: 30,
    maxRadius: 60,
    extraDocumentFee: 0, // Unlimited documents
    extraSignerFee: 15,
  },
  "ron-service": {
    basePrice: 25,
    maxDocuments: 999,
    maxSigners: 1,
    includedRadius: 0, // No travel
    maxRadius: 0,
    extraDocumentFee: 0,
    extraSignerFee: 10,
    sealFee: 5,
  },
}

export function calculatePricing(input: PricingInput): PricingResult {
  const config = SERVICE_CONFIGS[input.serviceId as keyof typeof SERVICE_CONFIGS]
  if (!config) {
    throw new Error(`Unknown service ID: ${input.serviceId}`)
  }

  const breakdown: PricingBreakdown[] = []
  let totalPrice = 0

  // Base service price
  const basePrice = config.basePrice
  totalPrice += basePrice
  breakdown.push({
    description: "Base Service Fee",
    amount: basePrice,
    type: "base",
  })

  // RON seal fees
  if (input.serviceId === "ron-service") {
    const sealFee = config.sealFee * Math.max(1, input.numberOfDocuments)
    totalPrice += sealFee
    breakdown.push({
      description: `Seal Fee (${Math.max(1, input.numberOfDocuments)} seal${input.numberOfDocuments > 1 ? "s" : ""})`,
      amount: sealFee,
      type: "fee",
    })
  }

  // Travel fee calculation
  let travelFee = 0
  const isWithinServiceArea = input.distanceMiles <= config.maxRadius

  if (input.serviceId !== "ron-service" && input.distanceMiles > config.includedRadius) {
    const extraMiles = input.distanceMiles - config.includedRadius
    travelFee = Math.ceil(extraMiles * 0.5) // $0.50 per mile
    totalPrice += travelFee
    breakdown.push({
      description: `Travel Fee (${extraMiles.toFixed(1)} miles beyond included radius)`,
      amount: travelFee,
      type: "travel",
    })
  }

  // Extra signer fees
  let extraSignerFee = 0
  if (input.numberOfSigners > config.maxSigners) {
    const extraSigners = input.numberOfSigners - config.maxSigners
    extraSignerFee = extraSigners * config.extraSignerFee
    totalPrice += extraSignerFee
    breakdown.push({
      description: `Extra Signer Fee (${extraSigners} additional signer${extraSigners > 1 ? "s" : ""})`,
      amount: extraSignerFee,
      type: "extra",
    })
  }

  // Extra document fees
  let extraDocumentFee = 0
  if (input.numberOfDocuments > config.maxDocuments && config.extraDocumentFee > 0) {
    const extraDocuments = input.numberOfDocuments - config.maxDocuments
    extraDocumentFee = extraDocuments * config.extraDocumentFee
    totalPrice += extraDocumentFee
    breakdown.push({
      description: `Extra Document Fee (${extraDocuments} additional document${extraDocuments > 1 ? "s" : ""})`,
      amount: extraDocumentFee,
      type: "extra",
    })
  }

  // Urgency fees
  let urgencyFee = 0
  if (input.urgencyLevel === "priority") {
    urgencyFee = 25
  } else if (input.urgencyLevel === "emergency") {
    urgencyFee = 50
  }

  if (urgencyFee > 0) {
    totalPrice += urgencyFee
    breakdown.push({
      description: `${input.urgencyLevel.charAt(0).toUpperCase() + input.urgencyLevel.slice(1)} Service Fee`,
      amount: urgencyFee,
      type: "urgency",
    })
  }

  // Weekend fee
  let weekendFee = 0
  if (input.isWeekend && input.serviceId !== "extended-hours") {
    weekendFee = 40
    totalPrice += weekendFee
    breakdown.push({
      description: "Weekend Service Fee",
      amount: weekendFee,
      type: "fee",
    })
  }

  // After hours fee (for extended hours service)
  let afterHoursFee = 0
  if (input.isAfterHours && input.serviceId === "extended-hours") {
    afterHoursFee = 25
    totalPrice += afterHoursFee
    breakdown.push({
      description: "After Hours Service Fee",
      amount: afterHoursFee,
      type: "fee",
    })
  }

  // Night service fee (9pm-7am)
  let nightServiceFee = 0
  if (input.isNightService) {
    nightServiceFee = 50
    totalPrice += nightServiceFee
    breakdown.push({
      description: "Night Service Fee (9pm-7am)",
      amount: nightServiceFee,
      type: "fee",
    })
  }

  // Witness fees
  let witnessFee = 0
  if (input.requiresWitness) {
    witnessFee = input.witnessType === "sourced" ? 50 : 0
    if (witnessFee > 0) {
      totalPrice += witnessFee
      breakdown.push({
        description: "Witness Sourcing Fee",
        amount: witnessFee,
        type: "fee",
      })
    }
  }

  return {
    basePrice,
    travelFee,
    urgencyFee,
    weekendFee,
    afterHoursFee,
    nightServiceFee,
    extraSignerFee,
    extraDocumentFee,
    witnessFee,
    totalPrice,
    breakdown,
    isWithinServiceArea,
    maxServiceRadius: config.maxRadius,
  }
}

// Distance calculation using Google Maps API
export async function calculateDistance(
  origin: string,
  destination: string,
): Promise<{ distance: number; duration: number; status: string }> {
  try {
    const response = await fetch("/api/calculate-distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ origin, destination }),
    })

    if (!response.ok) {
      throw new Error("Failed to calculate distance")
    }

    return await response.json()
  } catch (error) {
    console.error("Distance calculation error:", error)
    // Fallback to estimated distance
    return {
      distance: 15, // Default estimate
      duration: 30, // 30 minutes
      status: "estimated",
    }
  }
}

// Validate service constraints
export function validateServiceConstraints(input: PricingInput): string[] {
  const config = SERVICE_CONFIGS[input.serviceId as keyof typeof SERVICE_CONFIGS]
  const errors: string[] = []

  if (!config) {
    errors.push("Invalid service selected")
    return errors
  }

  // Check distance limits
  if (input.distanceMiles > config.maxRadius) {
    errors.push(`Service location is beyond our ${config.maxRadius}-mile service area`)
  }

  // Check signer limits for specific services
  if (input.serviceId === "quick-stamp" && input.numberOfSigners > 1) {
    errors.push("Quick-Stamp Local service is limited to 1 signer")
  }

  // Check document limits for specific services
  if (input.serviceId === "quick-stamp" && input.numberOfDocuments > 1) {
    errors.push("Quick-Stamp Local service is limited to 1 document")
  }

  return errors
}
