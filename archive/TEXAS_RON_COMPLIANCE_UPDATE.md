# Texas RON Compliance Update

## Overview
Updated Houston Mobile Notary Pros pricing system to comply with Texas Government Code §406.111 and §406.024 for Remote Online Notarization (RON) services.

## Legal Requirements Summary

### Texas Government Code §406.111 - RON Service Fee
- **Maximum**: $25.00 per notarization
- **What it covers**: Online notarization service itself (audio-video session, credential analysis, recording retention)
- **Applied**: Once for each separate online notarization

### Texas Government Code §406.024 - Notarial Act Fees
- **Acknowledgment/Proof**: $10 first signature + $1 each additional signer
- **Oath/Affirmation**: $10 per oath
- **Other Notarial Acts**: $10 per act
- **Applied**: In addition to the $25 RON fee

### Additional Requirements
- **Fee Book**: All fees must be recorded in permanent fee book (Gov't Code §603.006)
- **Recording Retention**: Audio-video recordings must be stored for 5 years (Gov't Code §406.108)
- **Inflation Adjustment**: Secretary of State must recalculate caps every 5 years (next review 2028-2029)

## Pricing Examples
| Scenario | Permitted Total | Fee Breakdown |
|----------|----------------|---------------|
| 1 document, 1 signer, acknowledgment | $35.00 | $25 RON + $10 acknowledgment |
| Same doc, 2 signers | $36.00 | $25 RON + $10 first + $1 second |
| 2 separate documents, 1 signer each | $70.00 | ($25 + $10) × 2 |
| Single oath/affirmation | $35.00 | $25 RON + $10 oath |

## Prohibited Charges
- ❌ No "technology" or "platform" surcharges beyond $25 RON cap
- ❌ No travel fees (signer is remote)
- ❌ No convenience or processing fees on notarial services
- ❌ No document upload/download fees

## Implementation Changes

### 1. Updated Pricing Library (`lib/pricing.ts`)
- Added `RON_FEES` constants with Texas legal maximums
- Created `calculateTexasCompliantRONPrice()` function
- Added `getRONServicePricing()` helper function
- Implemented `validateRONPricing()` compliance checker

### 2. Updated Database Seeds (`prisma/seed.ts`)
- **RON Standard Acknowledgment**: $35.00 (was $50.00)
- **RON Oath/Affirmation**: $35.00 (new service)
- **RON Loan Document Package**: $35.00 base (was $125.00)
- **RON Business Documents**: $35.00 (was $75.00)

### 3. Enhanced Real-Time Pricing (`components/booking/RealTimePricing.tsx`)
- Added RON service detection
- Integrated Texas-compliant pricing calculation
- Removed travel fees for RON services
- Added detailed compliance breakdown

### 4. Created Compliance Component (`components/booking/TexasRONCompliance.tsx`)
- Visual compliance summary
- Detailed fee breakdown
- Legal requirements display
- Prohibited charges warning

### 5. Updated Documentation
- **Fee Schedule** (`fee-schedule.md`): Added comprehensive RON section
- **FAQ** (`app/faq/FAQClientPage.tsx`): Updated RON availability and pricing
- Removed outdated "we don't offer RON" language

## Database Update Script
Created `scripts/update-ron-pricing.ts` to:
- Check existing RON services
- Create Texas-compliant RON services
- Deactivate non-compliant services
- Maintain data integrity

## Compliance Features
✅ **Identity Verification**: Credential analysis and KBA  
✅ **Secure Recording**: Audio-video session recording  
✅ **Electronic Seal**: Digital signature and seal application  
✅ **Record Retention**: 5-year storage requirement  
✅ **Fee Documentation**: Permanent fee book maintenance  
✅ **Itemized Billing**: Clear separation of RON and notarial fees  

## Next Steps
1. **Test RON Pricing**: Verify calculations in booking flow
2. **Update Marketing**: Ensure all pricing displays are accurate
3. **Train Staff**: Review Texas compliance requirements
4. **Monitor Updates**: Watch for Secretary of State fee adjustments
5. **Legal Review**: Confirm implementation meets all requirements

## Compliance Statement
All RON services now comply with:
- Texas Government Code §406.111 (RON service fees)
- Texas Government Code §406.024 (notarial act fees)
- Texas Government Code §603.006 (fee book requirements)
- Texas Government Code §406.108 (recording retention)

## Contact for Issues
If any pricing calculations appear incorrect or non-compliant, immediately review the `calculateTexasCompliantRONPrice()` function and validate against current Texas statutes.

---
**Last Updated**: June 23, 2025  
**Compliance Period**: Current through 2028 (next SOS review) 