// Pricing constants and calculation functions

// Base prices for different service types - these are starting points
export const BASE_PRICES = {
  standardNotary: 75,        // For up to 2 documents, 1-2 signers
  extendedHoursNotary: 100,  // For up to 5 documents, 1-2 signers (additional signer logic in calc function)
  loanSigningSpecialist: 150,// Flat fee
  specialtyNotaryService: 55, // Starting at for the simplest specialty service
  businessSolutions: 125,    // Monthly flat fee, likely not calculated here but good for reference
};

// Additional fees
export const ADDITIONAL_FEES = {
  extraSignerStandard: 10, // If >2 signers are somehow kept on Standard Notary instead of upgrading
  extraSignerExtended: 10, // For >2 signers on Extended Hours Notary
  extraSignerLoanSigning: 10, // For >4 signers on Loan Signing
  extraSignerSpecialty: 10, // For >1 or >2 signers on Specialty (depends on base definition)
  weekend: 40,
  holiday: 40,
  afterHours: 30,          // For services truly outside Extended Hours window, if approved
  extraDocument: 5,        // Reduced from 15 for more granular upselling on Standard if not bumping to Extended
  extendedTravel: 0.50,    // Per mile beyond the service's included radius
  overnightHandling: 35,
  bilingual: 20,
};

// Default service area radius in miles (fallback, specific services have their own)
export const DEFAULT_SERVICE_AREA_RADIUS = 15; // General fallback

// Included travel radius for each primary service type
export const SERVICE_INCLUDED_RADIUS = {
  standardNotary: 15,
  extendedHoursNotary: 20,
  loanSigningSpecialist: 25, // Premium service, give a bit more
  specialtyNotaryService: 15, // Default, can be overridden by specific specialty service record in DB
  businessSolutions: 20,      // For monthly clients
  supportService: 0,          // Typically no travel, or custom
};

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
];

// Calculate Standard Notary base price
// Standard Notary includes 1-2 signers in its $75 base.
// This function confirms the base price. Additional signers beyond 2 might incur ADDITIONAL_FEES.extraSignerStandard if not upgraded.
export function calculateStandardNotaryPrice(numberOfSigners: number): number {
  // Base price is fixed at $75, covering 1-2 signers.
  // If numberOfSigners > 2, the expectation is an upgrade to ExtendedHoursNotary or an explicit additional signer fee.
  return BASE_PRICES.standardNotary;
}

// Calculate Extended Hours Notary price based on number of signers
// Base $100 covers up to 2 signers. Additional signers are $10 each.
export function calculateExtendedHoursNotaryPrice(numberOfSigners: number): number {
  let price = BASE_PRICES.extendedHoursNotary;
  if (numberOfSigners > 2) {
    price += (numberOfSigners - 2) * ADDITIONAL_FEES.extraSignerExtended;
  }
  return price;
}

// Calculate travel fee based on distance and service's included radius
export function calculateTravelFee(distance: number, serviceIncludedRadius: number): number {
  if (distance <= serviceIncludedRadius) return 0;
  return (distance - serviceIncludedRadius) * ADDITIONAL_FEES.extendedTravel;
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
  serviceType: keyof typeof BASE_PRICES | 'supportService'; // Allow 'supportService' which might not be in BASE_PRICES
  numberOfSigners: number;
  distance: number;
  isWeekend: boolean;
  isHoliday: boolean;
  isAfterHours: boolean;
  extraDocuments: number;
  needsOvernightHandling: boolean;
  needsBilingualService: boolean;
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
    case "standardNotary":
      basePrice = calculateStandardNotaryPrice(numberOfSigners);
      if (numberOfSigners > 2) {
        // Ideally, client is guided to Extended Hours. If not, this fee applies.
        extraSignersFee = (numberOfSigners - 2) * ADDITIONAL_FEES.extraSignerStandard;
        serviceSpecificNotes.push(`${numberOfSigners} signers; Standard base covers 2. Consider Extended Hours Notary for better value.`);
      }
      break;
    case "extendedHoursNotary":
      basePrice = calculateExtendedHoursNotaryPrice(numberOfSigners);
      // extra signer fee is already baked into calculateExtendedHoursNotaryPrice
      if (numberOfSigners > 2) {
         serviceSpecificNotes.push(`${numberOfSigners} signers; Extended Hours base covers 2, additional ${ADDITIONAL_FEES.extraSignerExtended} per extra signer.`);
      }
      break;
    case "loanSigningSpecialist":
      basePrice = BASE_PRICES.loanSigningSpecialist;
      // LSS Flat fee covers up to 4 signers as per SOP.
      if (numberOfSigners > 4) {
        extraSignersFee = (numberOfSigners - 4) * ADDITIONAL_FEES.extraSignerLoanSigning;
        serviceSpecificNotes.push(`${numberOfSigners} signers; Loan Signing base covers 4.`);
      }
      break;
    case "specialtyNotaryService":
      basePrice = BASE_PRICES.specialtyNotaryService; // This is the "starting at" price
      // Assuming base specialty covers 1 signer. Add logic if it covers more.
      if (numberOfSigners > 1) {
        extraSignersFee = (numberOfSigners - 1) * ADDITIONAL_FEES.extraSignerSpecialty;
         serviceSpecificNotes.push(`${numberOfSigners} signers; Specialty base covers 1.`);
      }
      break;
    case "businessSolutions":
      basePrice = BASE_PRICES.businessSolutions; // Monthly flat fee, likely not subject to these granular additions
      serviceSpecificNotes.push("Business Solutions: Monthly flat rate. Contact for details on included services.");
      break;
    // Case for 'supportService' might be handled differently if prices are per-item from DB
    // For now, if it reaches here, assume a base price might be 0 or a nominal fee for calculation if not set elsewhere.
    default:
      const knownBasePriceKey = serviceType as keyof typeof BASE_PRICES;
      if (Object.prototype.hasOwnProperty.call(BASE_PRICES, knownBasePriceKey)) {
        basePrice = BASE_PRICES[knownBasePriceKey];
      } else {
        serviceSpecificNotes.push(`Unknown or non-calculable service type: ${serviceType}. Using default radius for travel if applicable.`);
        basePrice = 0; // Explicitly default to 0 if not found or for 'supportService'
      }
      break;
  }

  // Calculate additional fees
  const travelFee = calculateTravelFee(distance, includedRadius);
  const weekendHolidayFee = isWeekend || isHoliday ? ADDITIONAL_FEES.weekend : 0;
  const afterHoursFee = isAfterHours ? ADDITIONAL_FEES.afterHours : 0;
  // Extra documents fee applies primarily if not bumping to a higher service tier
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
  
  // Current pricing from our system
  let standardPrice = 50.00; // Default RON standard
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
      standardPrice = 50.00;
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
