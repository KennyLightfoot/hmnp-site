/*
 Quick pricing sanity checks: prints totals for common ZIPs/scenarios.
 Run: pnpm tsx scripts/pricing-sanity.ts
*/

import { UnifiedPricingEngine } from "@/lib/pricing/unified-pricing-engine";

type Scenario = {
  label: string;
  serviceType: 'STANDARD_NOTARY' | 'EXTENDED_HOURS' | 'RON_SERVICES';
  zip: string;
  acts?: number;
  when?: string; // ISO string
};

const business = new Date();
business.setHours(14, 0, 0, 0);
const afterHours = new Date();
afterHours.setHours(21, 0, 0, 0);

const zips = [
  { zip: '77591', label: 'Texas City (base)' },
  { zip: '77598', label: 'Webster' },
  { zip: '77058', label: 'Clear Lake' },
  { zip: '77584', label: 'Pearland' },
  { zip: '77478', label: 'Sugar Land' },
  { zip: '77550', label: 'Galveston' },
];

const scenarios: Scenario[] = [];

for (const { zip, label } of zips) {
  scenarios.push(
    { label: `${label} – business`, serviceType: 'STANDARD_NOTARY', zip, when: business.toISOString() },
    { label: `${label} – after-hours`, serviceType: 'EXTENDED_HOURS', zip, when: afterHours.toISOString() },
  );
}

// RON checks (acts 1 and 3)
scenarios.push(
  { label: `RON – base – 1 act`, serviceType: 'RON_SERVICES', zip: 'remote', acts: 1, when: business.toISOString() },
  { label: `RON – base – 3 acts`, serviceType: 'RON_SERVICES', zip: 'remote', acts: 3, when: business.toISOString() },
);

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

async function run() {
  console.log('\n=== Pricing Sanity Checks ===');
  for (const sc of scenarios) {
    try {
      const result = await UnifiedPricingEngine.calculateTransparentPricing({
        serviceType: sc.serviceType,
        documentCount: Math.max(1, sc.acts || 1),
        signerCount: 1,
        address: sc.zip,
        scheduledDateTime: sc.when,
        customerType: 'new',
      } as any);

      const timeFees = (result.breakdown.timeBasedSurcharges || []).reduce((s, f: any) => s + (f?.amount || 0), 0);
      const travel = (result.breakdown as any).travelFee?.amount || 0;
      const extras = (result.breakdown as any).extraDocuments?.amount || 0;

      console.log(
        `${sc.label.padEnd(26)} | base ${fmt(result.basePrice)} | travel ${fmt(travel)} | time ${fmt(timeFees)} | extras ${fmt(extras)} | total ${fmt(result.totalPrice)}`
      );
    } catch (e: any) {
      console.log(`${sc.label.padEnd(26)} | ERROR: ${e?.message || e}`);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


