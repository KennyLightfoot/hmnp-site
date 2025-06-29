// Pricing constants and calculation functions - Updated per SOP v2.0

// Base prices for different service types - Updated per SOP
export const BASE_PRICES = {
  quickStampLocal: 50,           // NEW: ≤ 1 doc, ≤ 2 stamps, 1 signer, ≤ 10 mi travel
  standardNotary: 75,            // ≤ 4 docs, ≤ 2 signers, ≤ 15 mi travel  
  extendedHoursNotary: 100,      // ≤ 4 docs, ≤ 2 signers, ≤ 15 mi travel, 7 am – 9 pm daily
  loanSigningSpecialist: 150,    // Single package, ≤ 4 signers, print 2 sets, ≤ 2 hrs table time, FedEx drop
  specialtyNotaryservice: 55,    // Starting at for the simplest specialty service
  businessSolutions: 125,        // Monthly flat fee (Essentials tier)
  businessGrowth: 349,           // Monthly flat fee (Growth tier)
  ronSession: 25,                // Per session base
  ronSeal: 5,                    // Per seal
};

// Additional fees - Updated per SOP
export const ADDITIONAL_FEES = {
  extraSignerStandard: 5,      // Updated: extra signer for Standard ($5 ea)
  extraSignerExtended: 5,      // Updated: extra signer for Extended ($5 ea)  
  extraSignerLoanSigning: 10,  // Loan signing extra signer (not in SOP base but logical)
  extraSignerSpecialty: 10,    // For specialty services
  extraStampQuickStamp: 5,     // NEW: Extra stamp for Quick-Stamp ($5 ea)
  extraSignerQuickStamp: 10,   // NEW: Extra signer for Quick-Stamp ($10 ea)
  extraDocument: 10,           // Updated: Extra doc ($10 ea per SOP)
  sameDayservice: 25,          // Same-day surcharge after 3 pm
  afterHoursservice: 50,       // Night service (9 pm – 7 am)
  weekend: 40,                 // Weekend fee (kept for compatibility)
  holiday: 40,                 // Holiday fee (kept for compatibility)
  extendedTravel: 0.50,        // $0.50/mile beyond service radius per SOP
  rushPrint: 20,               // Loan signing rush print
  scanBack: 15,                // Loan signing scan-back service
  overnightHandling: 35,       // Kept for compatibility
  bilingual: 20,               // Kept for compatibility
};

// Service area radius per SOP - 20-mile base radius from ZIP 77591
export const DEFAULT_SERVICE_AREA_RADIUS = 20; // 20-mile base radius per SOP

// Included travel radius for each service type - Updated per SOP
export const SERVICE_INCLUDED_RADIUS = {
  quickStampLocal: 10,           // NEW: 10-mile radius for Quick-Stamp
  standardNotary: 20,            // 20-mile base radius per SOP
  extendedHoursNotary: 20,       // Updated: 20-mile base radius per SOP
  loanSigningSpecialist: 30,     // SOP mentions 30 mi for loan signing
  specialtyNotaryservice: 20,    // 20-mile base radius per SOP
  businessSolutions: 20,         // 20-mile base radius per SOP
  businessGrowth: 20,            // 20-mile base radius per SOP  
  supportservice: 0,             // Typically no travel, or custom
};

// Federal holidays - Updated per SOP to include Juneteenth
export const FEDERAL_HOLIDAYS = [
  "New Year's Day",
  "Martin Luther King Jr. Day", 
  "Presidents' Day",
  "Memorial Day",
  "Juneteenth",                  // Added per SOP
  "Independence Day",
  "Labor Day", 
  "Columbus Day",
  "Veterans Day",
  "Thanksgiving Day",
  "Christmas Day",
];

// Calculate Quick-Stamp Local pricing - NEW per SOP
export function calculateQuickStampLocalPrice(
  numberOfSigners: number, 
  numberOfStamps: number
): { 
  basePrice: number; 
  extraSignersFee: number; 
  extraStampsFee: number; 
  totalPrice: number;
  notes: string[];
} {
  const notes: string[] = [];
  let basePrice = BASE_PRICES.quickStampLocal; // $50 base
  let extraSignersFee = 0;
  let extraStampsFee = 0;
  
  // Base covers 1 signer, extra signers are $10 each
  if (numberOfSigners > 1) {
    extraSignersFee = (numberOfSigners - 1) * ADDITIONAL_FEES.extraSignerQuickStamp;
    notes.push(`Extra signers (${numberOfSigners - 1}): $${extraSignersFee}`);
  }
  
  // Base covers 2 stamps, extra stamps are $5 each  
  if (numberOfStamps > 2) {
    extraStampsFee = (numberOfStamps - 2) * ADDITIONAL_FEES.extraStampQuickStamp;
    notes.push(`Extra stamps (${numberOfStamps - 2}): $${extraStampsFee}`);
  }
  
  const totalPrice = basePrice + extraSignersFee + extraStampsFee;
  
  return {
    basePrice,
    extraSignersFee, 
    extraStampsFee,
    totalPrice,
    notes
  };
}

// Calculate Standard Notary base price - Updated per SOP
export function calculateStandardNotaryPrice(
  numberOfSigners: number,
  numberOfDocuments: number
): {
  basePrice: number;
  extraSignersFee: number; 
  extraDocumentsFee: number;
  totalPrice: number;
  notes: string[];
} {
  const notes: string[] = [];
  let basePrice = BASE_PRICES.standardNotary; // $75 base
  let extraSignersFee = 0;
  let extraDocumentsFee = 0;
  
  // Base covers up to 2 signers, extra signers are $5 each
  if (numberOfSigners > 2) {
    extraSignersFee = (numberOfSigners - 2) * ADDITIONAL_FEES.extraSignerStandard;
    notes.push(`Extra signers (${numberOfSigners - 2}): $${extraSignersFee}`);
  }
  
  // Base covers up to 4 docs, extra docs are $10 each
  if (numberOfDocuments > 4) {
    extraDocumentsFee = (numberOfDocuments - 4) * ADDITIONAL_FEES.extraDocument;
    notes.push(`Extra documents (${numberOfDocuments - 4}): $${extraDocumentsFee}`);
  }
  
  const totalPrice = basePrice + extraSignersFee + extraDocumentsFee;
  
  return {
    basePrice,
    extraSignersFee,
    extraDocumentsFee, 
    totalPrice,
    notes
  };
}

// Calculate Extended Hours Notary price - Updated per SOP  
export function calculateExtendedHoursNotaryPrice(
  numberOfSigners: number,
  numberOfDocuments: number,
  isSameDay: boolean = false,
  isAfterHours: boolean = false
): {
  basePrice: number;
  extraSignersFee: number;
  extraDocumentsFee: number; 
  sameDayFee: number;
  afterHoursFee: number;
  totalPrice: number;
  notes: string[];
} {
  const notes: string[] = [];
  let basePrice = BASE_PRICES.extendedHoursNotary; // $100 base
  let extraSignersFee = 0;
  let extraDocumentsFee = 0;
  let sameDayFee = 0;
  let afterHoursFee = 0;
  
  // Base covers up to 2 signers, extra signers are $5 each
  if (numberOfSigners > 2) {
    extraSignersFee = (numberOfSigners - 2) * ADDITIONAL_FEES.extraSignerExtended;
    notes.push(`Extra signers (${numberOfSigners - 2}): $${extraSignersFee}`);
  }
  
  // Base covers up to 4 docs, extra docs are $10 each
  if (numberOfDocuments > 4) {
    extraDocumentsFee = (numberOfDocuments - 4) * ADDITIONAL_FEES.extraDocument;
    notes.push(`Extra documents (${numberOfDocuments - 4}): $${extraDocumentsFee}`);
  }
  
  // Same-day service after 3 pm: +$25
  if (isSameDay) {
    sameDayFee = ADDITIONAL_FEES.sameDayService;
    notes.push(`Same-day service: $${sameDayFee}`);
  }
  
  // After-hours service (9 pm – 7 am): +$50
  if (isAfterHours) {
    afterHoursFee = ADDITIONAL_FEES.afterHoursService;
    notes.push(`After-hours service: $${afterHoursFee}`);
  }
  
  const totalPrice = basePrice + extraSignersFee + extraDocumentsFee + sameDayFee + afterHoursFee;
  
  return {
    basePrice,
    extraSignersFee,
    extraDocumentsFee,
    sameDayFee, 
    afterHoursFee,
    totalPrice,
    notes
  };
}

// Calculate travel fee based on distance and service's included radius
export function calculateTravelFee(distance: number, serviceIncludedRadius: number): number {
  if (distance <= serviceIncludedRadius) return 0;
  return (distance - serviceIncludedRadius) * ADDITIONAL_FEES.extendedTravel;
}

// Calculate RON pricing per SOP - Updated 
export function calculateRONPrice(
  numberOfSessions: number = 1,
  numberOfSeals: number = 1
): {
  sessionFee: number;
  sealFee: number; 
  totalPrice: number;
  breakdown: string[];
} {
  const sessionFee = numberOfSessions * BASE_PRICES.ronSession; // $25/session
  const sealFee = numberOfSeals * BASE_PRICES.ronSeal; // $5/seal
  const totalPrice = sessionFee + sealFee;
  
  const breakdown = [
    `RON sessions (${numberOfSessions}): $${sessionFee}`,
    `Notary seals (${numberOfSeals}): $${sealFee}`,
    `Total: $${totalPrice}`
  ];
  
  return {
    sessionFee,
    sealFee,
    totalPrice,
    breakdown
  };
}

// Main pricing calculation function - Updated for SOP services
export function calculateTotalPrice({
  serviceType,
  numberOfSigners,
  numberOfDocuments = 1,
  numberOfStamps = 1,
  distance,
  isWeekend,
  isHoliday,
  isAfterHours,
  isSameDay = false,
  extraDocuments = 0,
  needsOvernightHandling,
  needsBilingualService,
}: {
  serviceType: keyof typeof BASE_PRICES | 'supportService';
  numberOfSigners: number;
  numberOfDocuments?: number;
  numberOfStamps?: number;
  distance: number;
  isWeekend: boolean;
  isHoliday: boolean;
  isAfterHours: boolean;
  isSameDay?: boolean;
  extraDocuments?: number;
  needsOvernightHandling: boolean;
  needsBilingualservice: boolean;
}): {
  basePrice: number;
  extraSignersFee: number;
  travelFee: number;
  weekendHolidayFee: number;
  afterHoursFee: number;
  extraDocumentsFee: number;
  overnightHandlingFee: number;
  bilingualFee: number;
  totalPrice: number;
  serviceSpecificNotes: string[];
} {
  let basePrice = 0;
  let extraSignersFee = 0;
  const serviceSpecificNotes: string[] = [];
  let includedRadius = SERVICE_INCLUDED_RADIUS[serviceType as keyof typeof SERVICE_INCLUDED_RADIUS] ?? DEFAULT_SERVICE_AREA_RADIUS;

  switch (serviceType) {
    case "quickStampLocal": {
      const calc = calculateQuickStampLocalPrice(numberOfSigners, numberOfStamps);
      basePrice = calc.basePrice;
      extraSignersFee = calc.extraSignersFee;
      serviceSpecificNotes.push(...calc.notes);
      break;
    }
    case "standardNotary": {
      const calc = calculateStandardNotaryPrice(numberOfSigners, numberOfDocuments);
      basePrice = calc.basePrice;
      extraSignersFee = calc.extraSignersFee;
      serviceSpecificNotes.push(...calc.notes);
      break;
    }
    case "extendedHoursNotary": {
      const calc = calculateExtendedHoursNotaryPrice(numberOfSigners, numberOfDocuments, isSameDay, isAfterHours);
      basePrice = calc.basePrice;
      extraSignersFee = calc.extraSignersFee;
      serviceSpecificNotes.push(...calc.notes);
      break;
    }
    case "loanSigningSpecialist":
      basePrice = BASE_PRICES.loanSigningSpecialist; // $150 flat fee
      // LSS covers up to 4 signers as per SOP
      if (numberOfSigners > 4) {
        extraSignersFee = (numberOfSigners - 4) * ADDITIONAL_FEES.extraSignerLoanSigning;
        serviceSpecificNotes.push(`${numberOfSigners} signers; Loan Signing base covers 4.`);
      }
      break;
    case "specialtyNotaryService":
      basePrice = BASE_PRICES.specialtyNotaryService;
      if (numberOfSigners > 1) {
        extraSignersFee = (numberOfSigners - 1) * ADDITIONAL_FEES.extraSignerSpecialty;
        serviceSpecificNotes.push(`${numberOfSigners} signers; Specialty base covers 1.`);
      }
      break;
    case "businessSolutions":
      basePrice = BASE_PRICES.businessSolutions; // $125/mo Essentials
      serviceSpecificNotes.push("Business Solutions Essentials: $125/month flat rate.");
      break;
    case "businessGrowth":
      basePrice = BASE_PRICES.businessGrowth; // $349/mo Growth
      serviceSpecificNotes.push("Business Solutions Growth: $349/month flat rate.");
      break;
    default:
      const knownBasePriceKey = serviceType as keyof typeof BASE_PRICES;
      if (Object.prototype.hasOwnProperty.call(BASE_PRICES, knownBasePriceKey)) {
        basePrice = BASE_PRICES[knownBasePriceKey];
      } else {
        serviceSpecificNotes.push(`Unknown service type: ${serviceType}. Using default radius for travel.`);
        basePrice = 0;
      }
      break;
  }

  // Calculate additional fees
  const travelFee = calculateTravelFee(distance, includedRadius);
  const weekendHolidayFee = isWeekend || isHoliday ? ADDITIONAL_FEES.weekend : 0;
  const afterHoursFee = isAfterHours ? ADDITIONAL_FEES.afterHoursService : 0;
  const extraDocumentsFee = extraDocuments * ADDITIONAL_FEES.extraDocument;
  const overnightHandlingFee = needsOvernightHandling ? ADDITIONAL_FEES.overnightHandling : 0;
  const bilingualFee = needsBilingualService ? ADDITIONAL_FEES.bilingual : 0;

  // Calculate total price
  const totalPrice =
    basePrice +
    extraSignersFee +
    travelFee +
    weekendHolidayFee +
    afterHoursFee +
    extraDocumentsFee +
    overnightHandlingFee +
    bilingualFee;

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
    serviceSpecificNotes,
  };
}

// Texas-Compliant RON Pricing (Gov't Code §406.111 and §406.024)
export const RON_FEES = {
  // RON service fee per Gov't Code §406.111 (max $25 per notarization)
  ronServiceFee: 25.00,
  
  // Notarial act fees per Gov't Code §406.024 (as amended 9-1-2023)
  acknowledgmentFirstSignature: 10.00,
  acknowledgmentAdditionalSignature: 1.00,
  oathAffirmation: 10.00,
  otherNotarialAct: 10.00,
  
  // Maximum caps for compliance
  maxRonServiceFee: 25.00,
  maxAcknowledgmentFirst: 10.00,
  maxAcknowledgmentAdditional: 1.00,
  maxOathAffirmation: 10.00,
  maxOtherNotarialAct: 10.00,
};

// Texas RON Pricing Calculator - Ensures compliance with state law
export function calculateTexasCompliantRONPrice(
  numberOfNotarizations: number,
  notarialActType: 'acknowledgment' | 'oath' | 'other' = 'acknowledgment',
  numberOfSigners: number = 1
): {
  ronServiceFee: number;
  notarialActFee: number;
  totalFee: number;
  breakdown: string[];
  complianceNotes: string[];
} {
  const breakdown: string[] = [];
  const complianceNotes: string[] = [];
  
  // Calculate RON service fee (Gov't Code §406.111)
  const ronServiceFee = numberOfNotarizations * RON_FEES.ronServiceFee;
  breakdown.push(`RON Service Fee (${numberOfNotarizations} notarization${numberOfNotarizations > 1 ? 's' : ''}): $${ronServiceFee.toFixed(2)}`);
  complianceNotes.push(`TX Gov't Code §406.111: $${RON_FEES.ronServiceFee} per online notarization`);
  
  // Calculate notarial act fee (Gov't Code §406.024)
  let notarialActFee = 0;
  
  if (notarialActType === 'acknowledgment') {
    // First signature: $10, additional signatures: $1 each
    notarialActFee = RON_FEES.acknowledgmentFirstSignature;
    if (numberOfSigners > 1) {
      notarialActFee += (numberOfSigners - 1) * RON_FEES.acknowledgmentAdditionalSignature;
    }
    breakdown.push(`Acknowledgment Fee (${numberOfSigners} signer${numberOfSigners > 1 ? 's' : ''}): $${notarialActFee.toFixed(2)}`);
    if (numberOfSigners > 1) {
      breakdown.push(`  - First signature: $${RON_FEES.acknowledgmentFirstSignature.toFixed(2)}`);
      breakdown.push(`  - Additional signatures (${numberOfSigners - 1}): $${((numberOfSigners - 1) * RON_FEES.acknowledgmentAdditionalSignature).toFixed(2)}`);
    }
    complianceNotes.push(`TX Gov't Code §406.024: $${RON_FEES.acknowledgmentFirstSignature} first signature + $${RON_FEES.acknowledgmentAdditionalSignature} each additional`);
  } else if (notarialActType === 'oath') {
    notarialActFee = RON_FEES.oathAffirmation;
    breakdown.push(`Oath/Affirmation Fee: $${notarialActFee.toFixed(2)}`);
    complianceNotes.push(`TX Gov't Code §406.024: $${RON_FEES.oathAffirmation} per oath/affirmation`);
  } else {
    notarialActFee = RON_FEES.otherNotarialAct;
    breakdown.push(`Other Notarial Act Fee: $${notarialActFee.toFixed(2)}`);
    complianceNotes.push(`TX Gov't Code §406.024: $${RON_FEES.otherNotarialAct} per other notarial act`);
  }
  
  const totalFee = ronServiceFee + notarialActFee;
  breakdown.push(`Total: $${totalFee.toFixed(2)}`);
  
  // Add compliance notes
  complianceNotes.push('All fees must be recorded in permanent fee book per Gov\'t Code §603.006');
  complianceNotes.push('Audio-video recording retained for 5 years per Gov\'t Code §406.108');
  
  return {
    ronServiceFee,
    notarialActFee,
    totalFee,
    breakdown,
    complianceNotes
  };
}

// Helper function to determine appropriate RON pricing for a service
export function getRONServicePricing(serviceType: string, numberOfSigners: number = 1): {
  standardPrice: number;
  compliancePrice: number;
  recommended: 'standard' | 'compliance';
  explanation: string;
} {
  // Calculate Texas-compliant pricing
  const complianceCalculation = calculateTexasCompliantRONPrice(1, 'acknowledgment', numberOfSigners);
  
  // Updated pricing from SOP
  let standardPrice = BASE_PRICES.ronSession + BASE_PRICES.ronSeal; // $25 + $5 = $30 default
  switch (serviceType.toLowerCase()) {
    case 'loan':
    case 'loan_signing_specialist':
      standardPrice = 125.00;
      break;
    case 'business':
    case 'business_solutions':
      standardPrice = 75.00;
      break;
    default:
      standardPrice = BASE_PRICES.ronSession + BASE_PRICES.ronSeal; // $30
  }
  
  const compliancePrice = complianceCalculation.totalFee;
  
  return {
    standardPrice,
    compliancePrice,
    recommended: compliancePrice < standardPrice ? 'compliance' : 'standard',
    explanation: compliancePrice < standardPrice 
      ? `Texas law caps RON fees at $${compliancePrice.toFixed(2)} for this service type`
      : `Current pricing of $${standardPrice.toFixed(2)} is within Texas legal limits`
  };
}

// Validate RON pricing against Texas legal limits
export function validateRONPricing(
  ronFee: number,
  notarialFee: number,
  numberOfNotarizations: number = 1,
  numberOfSigners: number = 1
): {
  isCompliant: boolean;
  violations: string[];
  maxAllowedTotal: number;
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Check RON service fee compliance
  const maxRonFee = numberOfNotarizations * RON_FEES.maxRonServiceFee;
  if (ronFee > maxRonFee) {
    violations.push(`RON service fee $${ronFee.toFixed(2)} exceeds legal maximum of $${maxRonFee.toFixed(2)}`);
  }
  
  // Check notarial act fee compliance (assuming acknowledgment as most common)
  const maxNotarialFee = RON_FEES.maxAcknowledgmentFirst + 
                         (numberOfSigners > 1 ? (numberOfSigners - 1) * RON_FEES.maxAcknowledgmentAdditional : 0);
  if (notarialFee > maxNotarialFee) {
    violations.push(`Notarial act fee $${notarialFee.toFixed(2)} exceeds legal maximum of $${maxNotarialFee.toFixed(2)}`);
  }
  
  const maxAllowedTotal = maxRonFee + maxNotarialFee;
  
  if (violations.length === 0) {
    recommendations.push('Pricing is compliant with Texas RON regulations');
  } else {
    recommendations.push(`Adjust pricing to comply with Texas Gov't Code §406.111 and §406.024`);
    recommendations.push(`Maximum allowed total: $${maxAllowedTotal.toFixed(2)}`);
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    maxAllowedTotal,
    recommendations
  };
}
