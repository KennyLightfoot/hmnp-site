import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create services using upsert (create if not exists, update if exists)
  const services = [
    {
      id: 'cmb8ovso10000ve9xwvtf0my0',
      name: 'Standard Mobile Notary',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 75.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'General notary services at your location. Includes travel within a 20-mile radius, printing, and scanning for standard documents.',
      duration: 90,
    },
    {
      id: 'cmb8p8ww20003veixccludati',
      name: 'Priority Mobile Notary (Rush)',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'Expedited mobile notary services for urgent needs. Higher priority scheduling.',
      duration: 90,
    },
    {
      id: 'cmb8ovsxo0001ve9xi40rj4g5',
      name: 'Loan Signing Specialist',
      serviceType: ServiceType.LOAN_SIGNING_SPECIALIST,
      price: 150.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'Specialized handling and notarization of real estate loan documents. Price starts at $150. Additional fees may apply for complex signings or extensive document packages.',
      duration: 180,
    },
    {
      id: 'cmb8ovt3d0002ve9xks32rktv',
      name: 'Extended Hours Notary',
      serviceType: ServiceType.EXTENDED_HOURS_NOTARY,
      price: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'After-hours notary services for your convenience. Available evenings and weekends.',
      duration: 90,
    },
    {
      id: 'cmb8p8wzg0005veixjjwvis8d',
      name: 'Corporate Document Notarization',
      serviceType: ServiceType.BUSINESS_SOLUTIONS,
      price: 125.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: false, // Deactivated
      description: 'Professional notarization services for corporate documents and business agreements.',
      duration: 120,
    },
    {
      id: 'cmb8p8wy70004veixh5vs1z5n',
      name: 'I-9 Employment Verification',
      serviceType: ServiceType.SPECIALTY_NOTARY_SERVICE,
      price: 50.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: false, // Deactivated
      description: 'I-9 employment verification services for HR departments.',
      duration: 60,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        serviceType: service.serviceType,
        price: service.price,
        depositAmount: service.depositAmount,
        requiresDeposit: service.requiresDeposit,
        active: service.active,
        description: service.description,
        duration: service.duration,
      },
      create: service,
    });
    console.log(`Upserted service: ${service.name} (ID: ${service.id})`);
  }

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
