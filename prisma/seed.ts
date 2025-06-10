import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Standard Mobile Notary ---
  await prisma.service.update({
    where: { id: 'cmb8ovso10000ve9xwvtf0my0' },
    data: {
      name: 'Standard Mobile Notary',
      serviceType: ServiceType.STANDARD_NOTARY,
      basePrice: 75.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      isActive: true,
      description: 'General notary services at your location. Includes travel within a 20-mile radius, printing, and scanning for standard documents.',
    },
  });
  console.log('Updated Standard Mobile Notary (ID: cmb8ovso10000ve9xwvtf0my0)');

  // --- Priority Mobile Notary (Rush Service) ---
  await prisma.service.update({
    where: { id: 'cmb8p8ww20003veixccludati' },
    data: {
      name: 'Priority Mobile Notary (Rush)',
      serviceType: ServiceType.STANDARD_NOTARY, // Assuming 'Priority' is a tier of STANDARD_NOTARY
      basePrice: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      isActive: true,
      description: 'Expedited mobile notary services for urgent needs. Higher priority scheduling.',
    },
  });
  console.log('Updated Priority Mobile Notary (ID: cmb8p8ww20003veixccludati)');

  // --- Loan Signing Specialist ---
  await prisma.service.update({
    where: { id: 'cmb8ovsxo0001ve9xi40rj4g5' },
    data: {
      name: 'Loan Signing Specialist',
      serviceType: ServiceType.LOAN_SIGNING_SPECIALIST,
      basePrice: 150.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      isActive: true,
      description: 'Specialized handling and notarization of real estate loan documents. Price starts at $150. Additional fees may apply for complex signings or extensive document packages.',
    },
  });
  console.log('Updated Loan Signing Specialist (ID: cmb8ovsxo0001ve9xi40rj4g5)');

  // --- Extended Hours Notary ---
  await prisma.service.update({
    where: { id: 'cmb8ovt3d0002ve9xks32rktv' },
    data: {
      name: 'Extended Hours Notary',
      serviceType: ServiceType.EXTENDED_HOURS_NOTARY,
      basePrice: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      isActive: true,
    },
  });
  console.log('Updated Extended Hours Notary (ID: cmb8ovt3d0002ve9xks32rktv)');

  // --- Deactivate Corporate Document Notarization ---
  await prisma.service.update({
    where: { id: 'cmb8p8wzg0005veixjjwvis8d' },
    data: {
      isActive: false,
      serviceType: ServiceType.BUSINESS_SOLUTIONS, // Keep original type for consistency
    },
  });
  console.log('Deactivated Corporate Document Notarization (ID: cmb8p8wzg0005veixjjwvis8d)');

  // --- Deactivate I-9 Employment Verification ---
  await prisma.service.update({
    where: { id: 'cmb8p8wy70004veixh5vs1z5n' },
    data: {
      isActive: false,
      serviceType: ServiceType.SPECIALTY_NOTARY_SERVICE, // Keep original type for consistency
    },
  });
  console.log('Deactivated I-9 Employment Verification (ID: cmb8p8wy70004veixh5vs1z5n)');

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
