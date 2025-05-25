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
